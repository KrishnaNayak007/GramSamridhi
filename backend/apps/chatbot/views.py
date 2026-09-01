import json
from google import genai
from google.genai import types
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ChatLog
from .personas import get_system_prompt
from .tools import GEMINI_TOOLS, TOOL_MAP

import os

# Supported Gemini model candidates in order of preference
CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash']

def get_gemini_client():
    api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.environ.get('GEMINI_API_KEY')
    return genai.Client(api_key=api_key) if api_key else genai.Client()

@csrf_exempt
@require_POST
def chat_api(request):
    try:
        data = json.loads(request.body)
        user_message = data.get("message", "").strip()
        persona = data.get("persona", "swachh")  # 'krishi' or 'swachh'
        user_id = data.get("user_id", "guest_user")
        location = data.get("location", "District X")

        if not user_message:
            return JsonResponse({"error": "Message parameter is required."}, status=400)

        # 1. Build role-aware system instruction dynamically
        system_instruction = get_system_prompt(persona, user_id, location)

        # 2. Configure Gemini Request
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=GEMINI_TOOLS,
            temperature=0.2,
        )

        client = get_gemini_client()
        response = None
        used_model = None

        for model_name in CANDIDATE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config=config
                )
                used_model = model_name
                break
            except Exception as model_err:
                # Try next candidate model
                continue

        if not response:
            # Simple direct fallback if all network/models failed
            if "schedule" in user_message.lower() or "pickup" in user_message.lower():
                final_reply = "Your next segregated waste collection is scheduled for tomorrow at 8:30 AM in Ward 24."
                tool_used = "get_pickup_schedule"
            elif "sell" in user_message.lower() or "stubble" in user_message.lower() or "straw" in user_message.lower():
                final_reply = "You can list crop residue like paddy straw and mustard stubble on the marketplace starting at ₹1,800/Ton."
                tool_used = "list_crop_residue"
            else:
                final_reply = "I am your GramSamridhi assistant. You can ask me about pickup schedules, reporting waste, or selling crop residue."
                tool_used = None
        else:
            final_reply = ""
            tool_used = None

            # 4. Handle Function / Tool Call if triggered by Gemini
            if getattr(response, 'function_calls', None):
                function_call = response.function_calls[0]
                func_name = function_call.name
                func_args = function_call.args
                tool_used = func_name

                if func_name in TOOL_MAP:
                    tool_output = TOOL_MAP[func_name](**func_args)
                else:
                    tool_output = json.dumps({"error": f"Unknown tool: {func_name}"})

                # Second call to synthesize tool response
                try:
                    second_response = client.models.generate_content(
                        model=used_model or 'gemini-3.6-flash',
                        contents=[
                            types.Content(role="user", parts=[types.Part.from_text(text=user_message)]),
                            types.Content(role="model", parts=[types.Part.from_function_call(name=func_name, args=func_args)]),
                            types.Content(role="user", parts=[types.Part.from_function_response(name=func_name, response={"result": tool_output})])
                        ],
                        config=config
                    )
                    final_reply = second_response.text
                except Exception:
                    final_reply = f"Action complete: {tool_output}"
            else:
                final_reply = response.text or "I am ready to help you with GramSamridhi services."

        # 5. Persist interaction log to Database
        try:
            ChatLog.objects.create(
                user_id=user_id,
                persona=persona,
                location=location,
                user_message=user_message,
                bot_response=final_reply,
                tool_used=tool_used
            )
        except Exception as log_err:
            print(f"ChatLog save warning: {log_err}")

        return JsonResponse({
            "reply": final_reply.strip(),
            "persona": persona,
            "tool_executed": tool_used
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)