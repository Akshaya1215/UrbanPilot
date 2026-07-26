"""
agents/synthesis_agent.py

Agent 4: The Synthesis & Arbitrage Agent ("The Brain") — NOT BUILT YET.

Planned job: this is where the actual "arbitrage" reasoning happens.
Takes the outputs of Agents 1, 2, and 3, evaluates every route
combination against a direct-cab benchmark, does the cost/time
trade-off math, and generates the final deep links sent back to the
user on WhatsApp.

Planned input:  outputs of run_geographic_agent, run_transit_agent, run_mobility_agent
Planned output: {"best_route": [...], "savings_rupees": float, "savings_minutes": int, "deep_links": [...]}

Build this last — it's the payoff node that makes the whole swarm's
value proposition ("we found you a combo that beats a direct cab")
visible.
"""

def run_synthesis_agent(geo_result: dict, transit_result: dict, mobility_result: dict) -> dict:
    raise NotImplementedError("Agent 4 is planned for the final milestone.")
