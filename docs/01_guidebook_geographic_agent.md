# Guidebook: Building the Geographic Agent

**Who this is for:** you, the agent developer.
**Goal:** understand every piece of `backend/agents/geographic_agent.py`
well enough to explain it live in review — not just run it.

---

## Chapter 1 — What this agent actually does

Input: a raw sentence, e.g. `"from Anna Nagar to T Nagar"`.

Output: a structured result telling you the coordinates of both places,
plus the nearest metro/rail station to each one.

```
"from Anna Nagar to T Nagar"
        │
        ▼
┌─────────────────────┐
│ 1. parse_locations   │  → figures out: origin="Anna Nagar", destination="T Nagar"
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 2. geocode_both      │  → looks up lat/lon for both, via OpenStreetMap
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 3. find_nearest_stations │ → finds nearest metro station to each point
└─────────────────────┘
        │
        ▼
   final structured result
```

This is Agent 1 of 4 in the swarm. It's the *only* one that needs zero
paid APIs and zero mock data — Nominatim and Overpass are free, public,
real OpenStreetMap services — which is exactly why it's the right one to
build first.

---

## Chapter 2 — Tech stack, and why each piece is there

| Piece | What it's for | Why this one |
|---|---|---|
| **Python** | implementation language | matches your existing LangGraph/agentic AI experience |
| **LangGraph** | orchestrates the 3 steps as a graph, not a plain function chain | lets Agents 2–4 be added as new nodes later without touching this file |
| **Nominatim (OpenStreetMap)** | text address → lat/lon | free, no API key, exactly matches the architecture diagram's "Input/Data Source" for this agent |
| **Overpass API** | lat/lon → nearby metro/rail stations | same OSM dataset, different query engine; free, no API key |
| **Gemini (`langchain-google-genai`)** | optional — extracts origin/destination from free-form text | Google AI Studio's free tier needs no credit card, so it's realistic to set up tonight. Fully optional: without a key, a regex fallback handles the common `"from X to Y"` phrasing |
| **Pydantic / TypedDict** | defines the shape of data flowing through the graph | this *is* the contract your teammate's webhook code relies on |

You do **not** need a Gemini API key for this to work tonight. The regex
fallback handles it. Get the key later if you want the "real" LLM parsing
for the review demo — it's a 2-minute signup at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey).

---

## Chapter 3 — Environment setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Leave `.env`'s `GOOGLE_API_KEY` blank for now if you want to skip that step —
the agent still runs correctly using the regex fallback.

---

## Chapter 4 — The contract first: `core/schema.py`

**Before writing any agent logic**, look at `backend/core/schema.py`. This
defines the exact shape of data flowing through the graph, using Python's
`TypedDict`:

```python
class GeoAgentState(TypedDict):
    user_message: str
    origin_text: Optional[str]
    destination_text: Optional[str]
    origin: Optional[LocationGeo]
    destination: Optional[LocationGeo]
    error: Optional[str]
```

**Why define this first, before any code that uses it?**
In a two-person team, this file is the interface. Your teammate's webhook
code will call `run_geographic_agent(message)` and get back a dict shaped
exactly like `GeoAgentState`. As long as this shape doesn't change without
warning, you can rewrite everything *inside* the agent — swap Nominatim
for Google Maps, add a fourth node, whatever — and your teammate's code
never breaks. This is the same principle as an API contract or a function
signature: agree on the shape first, then the two of you can work in
parallel without waiting on each other.

`Optional[str]` means "this field is either a string or `None`" — we use
`None` as the initial/unset value before a node has filled it in yet.

---

## Chapter 5 — Tool 1: Geocoding (`tools/geocode_tool.py`)

```python
def geocode_address(address: str, city_hint: str = "Chennai, India") -> dict | None:
    ...
    query = f"{address}, {city_hint}"
    params = {"q": query, "format": "jsonv2", "limit": 1}
    headers = {"User-Agent": USER_AGENT}
    response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
    ...
```

**What it does:** sends a text address to Nominatim's `/search` endpoint,
gets back the single best match as JSON, and pulls out the display name +
coordinates.

**Why the `city_hint` parameter?** "T Nagar" exists in multiple Indian
cities. Appending a city name disambiguates the search. This is also your
knob to change if your demo targets a different city than Chennai — just
pass a different `city_hint` value or change the default.

**Why the manual rate limiting (`time.sleep`)?** Nominatim's usage policy
caps free-tier usage at 1 request/second. This isn't optional politeness —
exceed it and Nominatim starts returning `403 Forbidden`, which would break
your demo mid-review. The `_last_call_time` global tracks when we last
called it, and we sleep out the remainder of that 1 second if needed.

**Why a custom `User-Agent` header?** Nominatim's policy also requires
identifying your application (the default header `python-requests/2.x`
gets blocked more aggressively). Put your real email in there before the
review in case anything needs following up.

**Why return `None` instead of raising an exception when nothing is found?**
"Address not found" is an expected, normal outcome (users will typo things),
not a crash-worthy error. Returning `None` lets the calling code (in
`geographic_agent.py`) decide what to do — in our case, produce a friendly
error message instead of an unhandled exception reaching the user.

---

## Chapter 6 — Tool 2: Nearest transit hub (`tools/transit_hub_tool.py`)

```python
query = f"""
[out:json][timeout:15];
(
  node(around:{radius_m},{lat},{lon})["railway"="station"];
  node(around:{radius_m},{lat},{lon})["station"="subway"];
);
out body;
"""
response = requests.post(OVERPASS_URL, data={"data": query}, timeout=20)
```

**What this is:** Overpass Query Language (OverpassQL) — a small
domain-specific query language for asking OpenStreetMap "give me all
nodes tagged X within Y meters of this point." `railway=station` and
`station=subway` are the two most common OSM tags used on metro station
nodes.

**Why not just use Nominatim again for this?** Nominatim is built for
*text search* ("find me a place matching this name"). Overpass is built
for *spatial + tag queries* ("find me every node with this tag within this
radius"). Different jobs, different tools — this is a common real pattern:
one API for search, another for spatial/structured queries over the same
underlying map data.

**The Haversine formula:**
```python
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(d_lambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))
```
Overpass returns stations within a radius, but doesn't sort them by exact
distance from your point — it just returns everything inside the bounding
circle. Haversine computes the **great-circle distance** between two
lat/lon points (i.e., straight-line distance over the Earth's curved
surface — not walking distance along roads, which would need a routing
engine like OSRM, planned for Agent 3). We use this to sort the results
and keep only the closest few.

**Why de-duplicate by name (`seen_names`)?** A single station is often
represented by multiple OSM nodes (e.g., separate entrances, or platform
nodes tagged the same way). Without de-duplication you'd show "T Nagar
Metro" three times in the output.

---

## Chapter 7 — Wiring the graph (`agents/geographic_agent.py`)

### The state graph

```python
graph = StateGraph(GeoAgentState)
graph.add_node("parse_locations", parse_locations)
graph.add_node("geocode_both", geocode_both)
graph.add_node("find_nearest_stations", find_nearest_stations)

graph.set_entry_point("parse_locations")
graph.add_edge("parse_locations", "geocode_both")
graph.add_conditional_edges(
    "geocode_both",
    route_after_geocode,
    {"find_nearest_stations": "find_nearest_stations", END: END},
)
graph.add_edge("find_nearest_stations", END)
```

**Why a graph instead of just calling three functions in a row?**
You *could* write:
```python
state = parse_locations(state)
state = geocode_both(state)
state = find_nearest_stations(state)
```
...and for exactly this one agent, it would behave identically. The reason
to use LangGraph anyway:
1. **Conditional routing is explicit and named.** `route_after_geocode`
   is a real, testable function that decides where to go next — not a
   buried `if` statement three levels deep in a script.
2. **This is the same shape Agents 2–4 will use.** When you add Agent 2,
   you're not refactoring this file — you're adding new nodes to a bigger
   graph (or composing agents as subgraphs). Building the habit now, on
   the simplest agent, means the pattern is already familiar when the
   swarm gets more complex.
3. **It matches the orchestrator-routing pattern** you already used in
   your Personal Workspace Assistant during the Titan internship — same
   mental model, new domain.

### Each node, in plain terms

- **`parse_locations`**: reads `state["user_message"]`, decides what the
  origin and destination are. Uses the Gemini LLM with structured output
  if `GOOGLE_API_KEY` is set; otherwise falls back to a regex matching
  `"from X to Y"`.

  **Why bother with an LLM here at all, if regex mostly works?** Regex
  only handles phrasings you explicitly anticipated. An LLM handles
  "I need to get to T Nagar, starting from Anna Nagar" or "T Nagar from
  Anna Nagar" without you writing a new regex for every phrasing. This is
  a legitimate, narrow use of an LLM — extracting two fields from messy
  text — not "LLM for LLM's sake."

  **What `with_structured_output(LocationPair)` does:** instead of asking
  the LLM to reply with prose and then trying to regex *that*, this tells
  LangChain to force the model's response into the shape of the
  `LocationPair` Pydantic model (`origin: str`, `destination: str`). You get
  back a typed Python object, not a string to parse.

- **`geocode_both`**: calls `geocode_address()` (Chapter 5) on both texts.
  If either fails, it sets `state["error"]` and leaves `origin`/`destination`
  as `None` — the graph then routes straight to `END` instead of crashing
  on a nearest-station lookup with no coordinates.

- **`find_nearest_stations`**: calls `find_nearest_transit_hubs()`
  (Chapter 6) for both points, attaches the results.

- **`route_after_geocode`**: the conditional edge function. LangGraph calls
  this after `geocode_both` runs, and whatever string it returns tells the
  graph which node to go to next (mapped via the dict passed to
  `add_conditional_edges`).

### The public entry point

```python
def run_geographic_agent(user_message: str) -> dict:
    initial_state: GeoAgentState = {...all fields set to None/empty...}
    return geographic_agent.invoke(initial_state)
```

This is the **only** function anyone outside this file should ever call.
Your teammate's webhook handler calls exactly this, and nothing else —
they never need to know a LangGraph graph exists underneath it.

---

## Chapter 8 — Testing it yourself

```bash
cd backend
python3 -m tests.test_geographic_agent
```

This prints the full JSON result to your terminal, so you can visually
confirm the coordinates and nearest stations look right before your
teammate wires it into WhatsApp. Expect it to take 2-4 seconds (rate
limiting + two API round trips).

Run the assertion-based version any time with:
```bash
pytest tests/
```

If you get an empty `nearest_stations` list for a real address, it usually
means either: the radius (`radius_m=1500`) is too small for that area, or
that particular station isn't tagged `railway=station` in OpenStreetMap
yet (coverage varies by city). Try increasing the radius first.

---

## Chapter 9 — Talking points for the review

If asked to justify design choices live, these are the honest answers:

- **"Why start with this agent?"** — It's the only one of the four that
  needs no mock data and no sandbox credentials to demo live and truthfully.
- **"Is this really 'agentic'?"** — Partially by design. The LLM node does
  real extraction work; the rest is deterministic tool-calling. The
  heavier reasoning (comparing time vs. money trade-offs) is Agent 4's job,
  intentionally — see `docs/00_project_overview.md`, section 6.
- **"What happens when it fails?"** — Both tools return `None`/empty
  results instead of raising, and the graph has an explicit conditional
  edge for the failure path, so a bad address produces a friendly WhatsApp
  message instead of a crash.
