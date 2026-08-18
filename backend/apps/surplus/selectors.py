from django.db.models import QuerySet, Count, Q
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.utils import timezone
from datetime import timedelta

from .models import Listing, Category, ListingEvent
from apps.accounts.models import User
from core.exceptions import ObjectNotFoundError, PermissionDeniedError

def get_listing(*, user: User, listing_id: str) -> Listing:
    """
    Retrieves a single Listing. Users can see their own listings of any status,
    but can only see active/reserved listings of other users.
    """
    try:
        listing = Listing.objects.select_related('owner', 'category', 'location').get(id=listing_id)
    except (Listing.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Listing with ID {listing_id} not found.")

    # Rule 10: Check authorization details on read
    if listing.owner != user and listing.status not in ('active', 'reserved'):
        raise PermissionDeniedError("You do not have permission to view this listing.")

    return listing

def list_listings(*, user: User, filters: dict = None) -> QuerySet:
    """
    Lists listings filterable by category, listing type, and spatial proximity.
    """
    queryset = Listing.objects.select_related('owner', 'category', 'location').all()
    filters = filters or {}

    # Rule 10: Users can see all active/reserved items, or their own items
    queryset = queryset.filter(
        Q(status__in=('active', 'reserved')) | Q(owner=user)
    )

    # Filter by category name or ID
    category = filters.get('category')
    if category:
        queryset = queryset.filter(category_id=category)

    # Filter by listing type (give_away, for_sale)
    listing_type = filters.get('listing_type')
    if listing_type:
        queryset = queryset.filter(listing_type=listing_type)

    # Proximity filter: listings within radius (default 10km) of lat,lon
    near = filters.get('near')
    if near:
        try:
            lat, lon = map(float, near.split(','))
            point = Point(lon, lat, srid=4326)
            radius = float(filters.get('radius', 10.0))
            queryset = queryset.filter(location__point__dwithin=(point, D(km=radius)))
        except ValueError:
            pass

    return queryset.order_by('-created_at')

def list_categories() -> QuerySet:
    """
    Retrieves available taxonomy categories.
    """
    return Category.objects.all().order_by('name')

def get_monthly_stats(*, user: User) -> dict:
    """
    Computes monthly marketplace stats: active listings, claimed listings, total interactions.
    """
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total active listings currently
    active_count = Listing.objects.filter(status='active').count()
    
    # Claimed listings this month
    claimed_this_month = Listing.objects.filter(
        status='claimed',
        updated_at__gte=start_of_month
    ).count()

    # Total events this month
    total_events = ListingEvent.objects.filter(
        created_at__gte=start_of_month
    ).count()

    return {
        "active_listings": active_count,
        "claimed_this_month": claimed_this_month,
        "total_interactions_this_month": total_events
    }

def get_impact_stats(*, user: User) -> dict:
    """
    Computes environmental impact stats for surplus reuse (claimed count, carbon savings equivalent).
    """
    # Count of successfully claimed listings by user
    total_claimed = Listing.objects.filter(owner=user, status='claimed').count()

    # Average environmental carbon reduction coefficient: 2.5kg CO2 saved per item reused
    co2_saved_kg = total_claimed * 2.5

    return {
        "claimed_items_count": total_claimed,
        "carbon_saved_co2_kg": co2_saved_kg,
        "water_saved_liters": total_claimed * 150 # Mock 150 liters saved per reused item
    }
