from django.db import transaction
from .models import Notification
from apps.accounts.models import User
from rest_framework.exceptions import ValidationError

@transaction.atomic
def send_notification(*, recipient_id: str, noti_type: str, payload: dict) -> Notification:
    """
    Creates and dispatches a notification record.
    """
    try:
        recipient = User.objects.get(id=recipient_id)
    except (User.DoesNotExist, ValueError):
        raise ValidationError({"recipient_id": "Target recipient user not found."})

    return Notification.objects.create(
        recipient=recipient,
        type=noti_type,
        payload=payload
    )
