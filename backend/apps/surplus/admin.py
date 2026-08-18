from django.contrib import admin
from .models import Category, Listing, ListingEvent

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']

class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'listing_type', 'status', 'created_at']
    list_filter = ['listing_type', 'status', 'category']
    search_fields = ['title', 'description']

class ListingEventAdmin(admin.ModelAdmin):
    list_display = ['listing', 'event_type', 'actor', 'created_at']
    list_filter = ['event_type', 'created_at']

admin.site.register(Category, CategoryAdmin)
admin.site.register(Listing, ListingAdmin)
admin.site.register(ListingEvent, ListingEventAdmin)
