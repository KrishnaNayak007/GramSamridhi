from django.core.exceptions import ObjectDoesNotExist
from .models import AdministrativeArea, Location
from core.exceptions import ObjectNotFoundError

def get_administrative_areas(area_type: str = None):
    """
    Fetches administrative areas, optionally filtered by type.
    """
    queryset = AdministrativeArea.objects.all()
    if area_type:
        queryset = queryset.filter(area_type=area_type)
    return queryset

def get_location_by_id(location_id: str) -> Location:
    """
    Fetches a single Location by its UUID, raises ObjectNotFoundError if missing.
    """
    try:
        return Location.objects.get(id=location_id)
    except (Location.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Location with ID {location_id} does not exist.")

def get_administrative_area_by_id(area_id: str) -> AdministrativeArea:
    """
    Fetches a single AdministrativeArea by its UUID, raises ObjectNotFoundError if missing.
    """
    try:
        return AdministrativeArea.objects.get(id=area_id)
    except (AdministrativeArea.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Administrative area with ID {area_id} does not exist.")
