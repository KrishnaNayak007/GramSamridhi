import json
from google import genai
from google.genai import types
from django.conf import settings

from .tools import GEMINI_TOOLS, TOOL_MAP

# Initialize Gemini Client using key from settings.py
api_key = getattr(settings, 'GEMINI_API_KEY', None)
client = genai.Client(api_key=api_key) if api_key else genai.Client()

MODEL_NAME = 'gemini-2.5-flash'


def query_gemini(user_message: str, system_instruction: str) -> tuple[str, str | None]:
    """
    Sends user query and system prompt to Gemini, handles tool calls automatically,
    and returns a tuple of (final_reply_text, tool_name_executed).
    """
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        tools=GEMINI_TOOLS,
        temperature=0.3,
    )

    # Initial request to Gemini
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user_message,
        config=config
    )

    tool_used = None

    # Handle tool/function invocation if triggered by Gemini
    if response.function_calls:
        function_call = response.function_calls[0]
        func_name = function_call.name
        func_args = function_call.args
        tool_used = func_name

        # Execute mapped function in tools.py
        if func_name in TOOL_MAP:
            tool_output = TOOL_MAP[func_name](**func_args)
        else:
            tool_output = json.dumps({"error": f"Unknown tool function: {func_name}"})

        # Send tool execution result back to Gemini
        second_response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                types.Content(role="user", parts=[types.Part.from_text(text=user_message)]),
                types.Content(role="model", parts=[types.Part.from_function_call(name=func_name, args=func_args)]),
                types.Content(role="user", parts=[types.Part.from_function_response(name=func_name, response={"result": tool_output})])
            ],
            config=config
        )
        return second_response.text, tool_used

    return response.text, tool_used