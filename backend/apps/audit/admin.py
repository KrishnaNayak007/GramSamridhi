from django.contrib import admin
from .models import AuditLog

class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['actor', 'action', 'target_type', 'target_id', 'created_at']
    list_filter = ['action', 'target_type', 'created_at']
    search_fields = ['target_id']

admin.site.register(AuditLog, AuditLogAdmin)
