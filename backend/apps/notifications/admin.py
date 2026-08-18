from django.contrib import admin
from .models import Notification

class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'type', 'read_at', 'created_at']
    list_filter = ['type', 'read_at']

admin.site.register(Notification, NotificationAdmin)
