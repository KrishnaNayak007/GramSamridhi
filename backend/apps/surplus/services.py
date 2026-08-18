from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.contrib.gis.geos import Point
from rest_framework.exceptions import ValidationError

from .models import Listing, Category, ListingEvent
from apps.geography.models import Location
from apps.evidence.models import Evidence

@transaction.atomic
def create_listing(
    *,
    owner,
    title: str,
    category_id: str,
    condition: str,
    listing_type: str,
    price: Decimal = None,
    description: str = "",
    latitude: float,
    longitude: float,
    photo_ids: list = None
) -> Listing:
    """
    Creates a new surplus listing with spatial location coordinates and photos.
    """
    # 1. Fetch Category
    try:
        category = Category.objects.get(id=category_id)
    except (Category.DoesNotExist, ValueError):
        raise ValidationError({"category_id": "Invalid category reference."})

    # 2. Create Location
    point = Point(longitude, latitude, srid=4326)
    location = Location.objects.create(
        point=point,
        source='MANUAL',
        captured_at=timezone.now()
    )

    # 3. Create Listing record
    listing = Listing.objects.create(
        owner=owner,
        title=title,
        category=category,
        condition=condition,
        listing_type=listing_type,
        price=price,
        description=description,
        location=location,
        status='active'
    )

    # 4. Attach Photos
    if photo_ids:
        photos = Evidence.objects.filter(id__in=photo_ids)
        listing.photos.set(photos)

    # 5. Log audit action
    try:
        from apps.audit.services import log_action
        log_action(
            actor=owner,
            action="create_listing",
            target_type="Listing",
            target_id=str(listing.id),
            metadata={"listing_type": listing_type}
        )
    except Exception as e:
        print("Audit logging failed:", e)

    return listing

@transaction.atomic
def record_listing_event(*, listing_id: str, event_type: str, actor=None) -> ListingEvent:
    """
    Tracks actions performed on a Listing for statistical compilation.
    """
    try:
        listing = Listing.objects.get(id=listing_id)
    except (Listing.DoesNotExist, ValueError):
        from core.exceptions import ObjectNotFoundError
        raise ObjectNotFoundError(f"Listing with ID {listing_id} not found.")

    event = ListingEvent.objects.create(
        listing=listing,
        event_type=event_type,
        actor=actor
    )
    return event
