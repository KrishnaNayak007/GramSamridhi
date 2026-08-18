from django.db.models import QuerySet
from .models import User, UserPreferences, UserSession

def get_preferences(*, user: User) -> UserPreferences:
    """
    Retrieves the UserPreferences for a user.
    """
    preferences, _ = UserPreferences.objects.get_or_create(user=user)
    return preferences

def list_sessions(*, user: User) -> QuerySet:
    """
    Retrieves the active user sessions for a user.
    """
    return UserSession.objects.filter(user=user).order_by('-last_active')
