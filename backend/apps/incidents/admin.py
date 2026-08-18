from django.contrib import admin
from .models import CitizenReport, CivicIncident

class CitizenReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'citizen', 'submitted_at', 'client_uuid']
    search_fields = ['citizen__username', 'description']
    list_filter = ['submitted_at']

class CivicIncidentAdmin(admin.ModelAdmin):
    list_display = ['id', 'category', 'status', 'citizen_report_count', 'first_reported_at']
    list_filter = ['category', 'status']
    search_fields = ['category']

admin.site.register(CitizenReport, CitizenReportAdmin)
admin.site.register(CivicIncident, CivicIncidentAdmin)
