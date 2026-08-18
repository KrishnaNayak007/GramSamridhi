from django.contrib import admin
from .models import Assignment, StatusHistory

class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['incident', 'officer', 'assigned_at', 'assigned_by']
    list_filter = ['assigned_at']

class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['incident', 'from_status', 'to_status', 'changed_by', 'changed_at']
    list_filter = ['changed_at']

admin.site.register(Assignment, AssignmentAdmin)
admin.site.register(StatusHistory, StatusHistoryAdmin)
