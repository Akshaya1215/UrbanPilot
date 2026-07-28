"""
CrewAI wrapper for Agent 3 (Transit Data Agent).

This turns the plain-Python transit_agent.py logic into a real CrewAI
Agent that an LLM (Gemini) can call as a Tool. Run this file directly
to test it - it will make a real call to Gemini, so it needs
GOOGLE_API_KEY set in your .env file.
"""

import os
import json
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

from agents.transit_agent import run_transit_agent
from shared.schemas import MOCK_ROUTE_OPTIONS

load_dotenv()  # reads GOOGLE_API_KEY from your .env file


# ---------------------------------------------------------------------------
# Set up the LLM (Gemini) - same model your teammate already has working
# ---------------------------------------------------------------------------

gemini_llm = LLM(
    model="gemini/gemini-3.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
)


# ---------------------------------------------------------------------------
# Wrap the plain function as a CrewAI Tool
# ---------------------------------------------------------------------------

@tool("Transit Data Tool")
def transit_data_tool(route_options_json: str) -> str:
    """Given a JSON string of route options (each with a list of legs),
    returns fare, duration, next departure, and delay status for every
    bus/train/metro leg found across all routes. Input must be a JSON
    string matching the RouteOption schema."""
    route_options = json.loads(route_options_json)
    results = run_transit_agent(route_options)
    return json.dumps(results)


# ---------------------------------------------------------------------------
# Define the Agent
# ---------------------------------------------------------------------------

transit_agent = Agent(
    role="Transit Data Specialist",
    goal="Retrieve accurate fare, schedule, and live delay information "
         "for every bus/train/metro leg in a set of route options.",
    backstory=(
        "You are a meticulous public transit analyst. You always call "
        "the Transit Data Tool to get real fare and schedule numbers "
        "rather than guessing, and you clearly flag any delays to the "
        "traveler."
    ),
    tools=[transit_data_tool],
    llm=gemini_llm,
    verbose=True,
)


# ---------------------------------------------------------------------------
# Define the Task
# ---------------------------------------------------------------------------

transit_task = Task(
    description=(
        "Here are the candidate route options as JSON:\n\n{route_options_json}\n\n"
        "Use the Transit Data Tool to get fare, duration, and delay info "
        "for every bus/train/metro leg. Then summarize: for each transit "
        "leg, state the line number, fare, duration, and whether it's "
        "delayed. Keep it concise - a few lines per leg."
    ),
    expected_output="A short summary of every bus/train leg's fare, duration, and delay status.",
    agent=transit_agent,
)


if __name__ == "__main__":
    crew = Crew(
        agents=[transit_agent],
        tasks=[transit_task],
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff(inputs={
        "route_options_json": json.dumps(MOCK_ROUTE_OPTIONS),
    })

    print("\n\n=== FINAL OUTPUT ===")
    print(result)