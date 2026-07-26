# Project Overview — Multi-Modal Transit Fare & Time Arbitrage Swarm

Use this doc as your talking-point script for the "explain the whole idea"
part of tomorrow's review. It's written to be *said out loud*, not just read.

## 1. The problem, in one breath

Someone commuting in an Indian metro city has to mentally juggle three
separate apps — the metro app, Rapido/Uber, and their own sense of walking
distance — to figure out whether it's cheaper and faster to take a bike-taxi
to the metro and ride four stops, or just book a direct cab. Prices and
travel times for the cab/auto leg change *by the minute* (surge pricing),
so this isn't a "compute once" problem — it's a live optimization that no
human can reasonably do in their head before their ride shows up.

## 2. Why this needs a *swarm*, not one script

Each data source involved has a completely different shape, refresh rate,
and failure mode:

| Data source | Refresh rate | What can go wrong |
|---|---|---|
| Street addresses → coordinates | Static | Ambiguous place names |
| Metro timetables | Scheduled (GTFS) | Delays, last-train cutoffs |
| Auto/bike/cab pricing | Live, surge-based | API downtime, price spikes |

Treating this as one monolithic script means one flaky API call (say, the
cab pricing API timing out) breaks the entire pipeline. Splitting it into
**independent agents**, each responsible for one data source, means:
- Each agent can be tested, swapped, or retried on its own.
- A slow/failing agent doesn't have to block the others (they can run in
  parallel).
- It maps directly onto how a human would delegate this: "you check the
  metro app, I'll check Rapido, someone else does the math."

That delegation — specialized workers feeding a final decision-maker — is
exactly the agentic AI pattern this project is built on.

## 3. The four agents

1. **Geographic Agent ("The Mapper")** — turns raw text addresses into GPS
   coordinates and finds the nearest metro/transit hubs. *(Built for this review.)*
2. **Public Transit Agent ("The Metro Expert")** — queries a GTFS
   (General Transit Feed Specification) dataset for train timings, schedules,
   and fixed fares between two stations.
3. **Open Mobility Agent ("The Negotiator")** — checks live surge pricing and
   availability for autos/bikes/direct cabs via a Beckn/ONDC mobility sandbox.
4. **Synthesis & Arbitrage Agent ("The Brain")** — the payoff node. Takes all
   three agents' outputs, compares every combination against a direct-cab
   benchmark, and picks the winner on cost and time — then generates
   deep links so the user can book with one tap.

## 4. The workflow, end to end

```
[ User via WhatsApp ]
        |
        v
[ Webhook / Backend Controller ]
        |
        |--> 1. Geographic Agent   (resolves coordinates & transit hubs)
        |--> 2. Public Transit Agent (queries metro GTFS DB)
        |--> 3. Open Mobility Agent  (pings Beckn/ONDC sandbox & OSRM)
        |
        v
[ 4. Synthesis & Arbitrage Agent ]
        | (compares multi-modal vs. direct cab)
        v
[ WhatsApp reply with deep links ]
```

## 5. What's actually built right now

Agent 1 (Geographic Agent) is fully working, end to end, live on WhatsApp:
- Takes a free-text message ("from Anna Nagar to T Nagar")
- Geocodes both locations via OpenStreetMap's Nominatim API
- Finds the nearest real metro/rail station to each, via the Overpass API
- Built as a LangGraph state graph (not a single function) — three nodes,
  one conditional edge for error handling — specifically so Agents 2–4 can
  be added as new nodes later without anyone rewriting this one.

Agents 2–4 exist as stub files with documented planned inputs/outputs, so
the whole architecture is visible in the repo even before they're built.

## 6. If asked "why LangGraph / why call this agentic AI and not just an API pipeline"

Two honest, defensible answers:
- **State graph vs. plain function chaining**: LangGraph gives explicit
  conditional routing (e.g., "if geocoding fails, skip station lookup and
  return an error") as a first-class part of the graph, not a pile of
  if/else. That structure is what makes it easy to add agents 2–4 as
  parallel branches later.
- **Where the actual reasoning lives**: Agent 1 today is mostly
  deterministic tool-calling (geocode, then look up nearby stations). The
  genuinely agentic reasoning — the LLM comparing trade-offs across
  incompatible units (money vs. minutes) and deciding what to recommend —
  lives in Agent 4, the Synthesis & Arbitrage Agent, which is next on the
  roadmap. It's honest to say review 1 demonstrates the *infrastructure*
  for the swarm; the *reasoning* payoff arrives with Agent 4.
