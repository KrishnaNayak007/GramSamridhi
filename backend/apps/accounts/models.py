from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel
import uuid

class User(AbstractUser):
    """
    Custom Unified User model supporting Citizens and Authority Officers.
    """
    ROLE_CHOICES = (
        ('citizen', 'Citizen'),
        ('officer', 'Authority Officer'),
        ('farmer', 'Farmer'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='citizen')
    phone = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        db_table = 'accounts_user'

class UserPreferences(BaseModel):
    """
    User settings preferences (language, theme, units, notification toggles, etc.).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    language = models.CharField(max_length=10, default='en')
    distance_unit = models.CharField(max_length=5, default='km')
    theme = models.CharField(max_length=10, default='light')
    font_size = models.CharField(max_length=10, default='medium')
    
    # Notification controls
    notify_swc_updates = models.BooleanField(default=True)
    notify_surplus_updates = models.BooleanField(default=True)
    notify_messages = models.BooleanField(default=True)
    notify_impact = models.BooleanField(default=True)
    notify_email = models.BooleanField(default=True)
    
    PROFILE_VISIBILITY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    CONTACT_VISIBILITY_CHOICES = (
        ('everyone', 'Everyone'),
        ('verified_only', 'Verified Only'),
    )
    LOCATION_SHARING_CHOICES = (
        ('always', 'Always'),
        ('while_reporting', 'While Reporting'),
        ('never', 'Never'),
    )

    # Privacy & Sharing
    profile_visibility = models.CharField(max_length=15, choices=PROFILE_VISIBILITY_CHOICES, default='public')
    contact_visibility = models.CharField(max_length=20, choices=CONTACT_VISIBILITY_CHOICES, default='everyone')
    location_sharing = models.CharField(max_length=20, choices=LOCATION_SHARING_CHOICES, default='always')
    activity_status_visible = models.BooleanField(default=True)
    data_saver_mode = models.BooleanField(default=False)
    auto_refresh = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

class UserSession(BaseModel):
    """
    Tracks active authentication sessions (devices/logins) linked to JWT tokens.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    jti = models.CharField(max_length=255, unique=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.id} for {self.user.username}"
