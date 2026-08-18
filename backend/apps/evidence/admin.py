from django.contrib import admin
from .models import Evidence

class EvidenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'media_type', 'status', 'checksum', 'uploaded_at']
    list_filter = ['media_type', 'status']
    search_fields = ['checksum']

admin.site.register(Evidence, EvidenceAdmin)
