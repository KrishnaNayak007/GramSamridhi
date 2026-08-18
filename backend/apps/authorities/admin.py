from django.contrib import admin
from .models import Department, Authority, OfficerProfile

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']

class AuthorityAdmin(admin.ModelAdmin):
    list_display = ['id', 'department', 'administrative_area']
    list_filter = ['department']

class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'jurisdiction', 'role_title']
    list_filter = ['department', 'jurisdiction']
    search_fields = ['user__username', 'role_title']

admin.site.register(Department, DepartmentAdmin)
admin.site.register(Authority, AuthorityAdmin)
admin.site.register(OfficerProfile, OfficerProfileAdmin)
