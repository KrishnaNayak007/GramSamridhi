from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserPreferences, UserSession

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'phone', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('role', 'phone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Info', {'fields': ('role', 'phone')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserPreferences)
admin.site.register(UserSession)
