"""
agents/mobility_agent_prototype/mobility_agent_crewai.py

CrewAI wrapper for Agent 3 (Open Mobility Agent).

Turns the plain-Python mobility_agent.py logic into a real CrewAI Agent
that Gemini can call as a Tool. Needs GOOGLE_API_KEY in your .env file
(same one you already set up for the transit agent).

Run this file directly to test - makes a real call to Gemini.
"""

import os
import json
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

from agents.mobility_agent_prototype.mobility_agent import run_mobility_agent

load_dotenv()


# ---------------------------------------------------------------------------
# Same Gemini setup as the transit agent
# ---------------------------------------------------------------------------

gemini_llm = LLM(
    model="gemini/gemini-3.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
)


# ---------------------------------------------------------------------------
# Wrap the plain function as a CrewAI Tool
# ---------------------------------------------------------------------------

@tool("Mobility Pricing Tool")
def mobility_pricing_tool(from_lat: float, from_lon: float, to_lat: float, to_lon: float) -> str:
    """Given a from/to lat-lon pair, returns fare, ETA, and surge
    multiplier for auto, bike, and cab options between those two points,
    factoring in live weather and time-of-day traffic. Returns a JSON
    string list with one entry per mode."""
    results = run_mobility_agent(from_lat, from_lon, to_lat, to_lon)
    return json.dumps(results)


# ---------------------------------------------------------------------------
# Define the Agent
# ---------------------------------------------------------------------------

mobility_agent = Agent(
    role="Open Mobility Pricing Analyst",
    goal="Compare auto, bike, and cab pricing and ETA between two points, "
         "accounting for live weather and traffic conditions, and "
         "recommend the best option for cost vs speed.",
    backstory=(
        "You are a sharp, practical mobility pricing analyst. You always "
        "call the Mobility Pricing Tool to get real numbers rather than "
        "guessing, and you clearly explain which option is cheapest and "
        "which is fastest."
    ),
    tools=[mobility_pricing_tool],
    llm=gemini_llm,
    verbose=True,
)


# ---------------------------------------------------------------------------
# Define the Task
# ---------------------------------------------------------------------------

mobility_task = Task(
    description=(
        "Compare on-demand mobility options from ({from_lat}, {from_lon}) "
        "to ({to_lat}, {to_lon}). Use the Mobility Pricing Tool to get "
        "real fare/ETA/surge numbers for auto, bike, and cab. Then "
        "summarize: state each mode's fare and ETA, and clearly call out "
        "which is cheapest and which is fastest."
    ),
    expected_output="A short comparison of auto/bike/cab fare and ETA, naming the cheapest and fastest option.",
    agent=mobility_agent,
)


if __name__ == "__main__":
    crew = Crew(
        agents=[mobility_agent],
        tasks=[mobility_task],
        process=Process.sequential,
        verbose=True,
    )

    # CBE Railway Station -> Martin's Apartments (approx)
    result = crew.kickoff(inputs={
        "from_lat": 11.0018, "from_lon": 76.9629,
        "to_lat": 11.0510, "to_lon": 76.9910,
    })

    print("\n\n=== FINAL OUTPUT ===")
    print(result)