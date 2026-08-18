from django.contrib.gis import admin
from .models import Location, AdministrativeArea

class AdministrativeAreaAdmin(admin.GISModelAdmin):
    list_display = ['name', 'area_type', 'parent']
    list_filter = ['area_type']
    search_fields = ['name']

class LocationAdmin(admin.GISModelAdmin):
    list_display = ['id', 'source', 'captured_at']
    list_filter = ['source']

admin.site.register(AdministrativeArea, AdministrativeAreaAdmin)
admin.site.register(Location, LocationAdmin)
