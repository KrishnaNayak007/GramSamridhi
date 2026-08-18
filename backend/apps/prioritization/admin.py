from django.contrib import admin
from .models import PriorityAssessment

class PriorityAssessmentAdmin(admin.ModelAdmin):
    list_display = ['incident', 'score', 'calculated_at']
    list_filter = ['calculated_at']
    search_fields = ['incident__id']

admin.site.register(PriorityAssessment, PriorityAssessmentAdmin)
