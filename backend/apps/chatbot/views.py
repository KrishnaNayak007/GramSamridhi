import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ChatLog
from .personas import get_system_prompt
from .llm_client import query_gemini


@csrf_exempt
@require_POST
def chat_api(request):
    try:
        data = json.loads(request.body)
        user_message = data.get("message", "")
        persona = data.get("persona", "swachh")  # 'krishi' or 'swachh'
        user_id = data.get("user_id", "guest_user")
        location = data.get("location", "District X")

        if not user_message:
            return JsonResponse({"error": "Message parameter is required."}, status=400)

        # 1. Generate persona prompt
        system_prompt = get_system_prompt(persona, user_id, location)

        # 2. Query Gemini via llm_client module
        reply_text, tool_used = query_gemini(user_message, system_prompt)

        # 3. Log interaction to SQLite database
        ChatLog.objects.create(
            user_id=user_id,
            persona=persona,
            location=location,
            user_message=user_message,
            bot_response=reply_text,
            tool_used=tool_used
        )

        return JsonResponse({
            "reply": reply_text,
            "persona": persona,
            "tool_executed": tool_used
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)