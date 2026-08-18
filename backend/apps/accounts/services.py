from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
from .models import User, UserPreferences, UserSession
from core.exceptions import ObjectNotFoundError

@transaction.atomic
def update_preferences(*, user: User, data: dict) -> UserPreferences:
    """
    Updates the preferences for a specific user.
    Creates default preferences if they don't exist.
    """
    preferences, _ = UserPreferences.objects.get_or_create(user=user)
    for field, value in data.items():
        if hasattr(preferences, field) and field != 'user':
            setattr(preferences, field, value)
    preferences.save()
    return preferences

@transaction.atomic
def change_password(*, user: User, old_password: str, new_password: str) -> User:
    """
    Changes a user's password securely, running standard validation checks.
    """
    if not user.check_password(old_password):
        raise ValidationError({"old_password": "Old password is incorrect."})
    
    validate_password(new_password, user=user)
    user.set_password(new_password)
    user.save()
    return user

@transaction.atomic
def create_session(*, user: User, jti: str, ip_address: str = None, user_agent: str = None) -> UserSession:
    """
    Records a new active session (login) for the user.
    """
    return UserSession.objects.create(
        user=user,
        jti=jti,
        ip_address=ip_address,
        user_agent=user_agent
    )

@transaction.atomic
def revoke_session(*, user: User, session_id: str):
    """
    Deletes (revokes) a specific active session and blacklists its simplejwt token JTI.
    """
    try:
        session = UserSession.objects.get(id=session_id)
    except (UserSession.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Session with ID {session_id} not found.")

    if session.user != user:
        raise ValidationError("You do not have permission to revoke this session.")

    # Converged blacklist mechanism on OutstandingToken JTI
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        outstanding = OutstandingToken.objects.filter(jti=session.jti).first()
        if outstanding:
            BlacklistedToken.objects.get_or_create(token=outstanding)
    except Exception:
        pass

    session.delete()
