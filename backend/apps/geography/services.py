from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.utils import timezone
from .models import AdministrativeArea, Location
from core.exceptions import ValidationError

def resolve_administrative_area(point: Point) -> AdministrativeArea | None:
    """
    Resolves a given geospatial Point to the containing WARD.
    If the point does not sit inside any boundary polygon, falls back to finding the nearest Ward.
    """
    if not isinstance(point, Point):
        raise ValidationError("Input must be a GEOS Point instance.")

    # 1. Look for WARD or VILLAGE that spatially contains the point
    leaf_area = AdministrativeArea.objects.filter(
        area_type__in=['WARD', 'VILLAGE'],
        boundary__contains=point
    ).first()

    if leaf_area:
        return leaf_area

    # 2. Fallback: Find the nearest leaf boundary if outside defined polygons
    nearest_leaf = AdministrativeArea.objects.filter(
        area_type__in=['WARD', 'VILLAGE'],
        boundary__isnull=False
    ).annotate(
        distance=Distance('boundary', point)
    ).order_by('distance').first()

    return nearest_leaf

def create_location(latitude: float, longitude: float, source: str = 'GPS', captured_at=None) -> Location:
    """
    Creates and saves a Location instance from latitude and longitude.
    """
    if not (-90.0 <= latitude <= 90.0):
        raise ValidationError("Latitude must be between -90 and 90 degrees.")
    if not (-180.0 <= longitude <= 180.0):
        raise ValidationError("Longitude must be between -180 and 180 degrees.")
    if source not in ('GPS', 'MANUAL'):
        raise ValidationError("Source must be either 'GPS' or 'MANUAL'.")

    # GIS Point represents (X, Y) which translates to (Longitude, Latitude)
    point = Point(longitude, latitude, srid=4326)
    
    if not captured_at:
        captured_at = timezone.now()

    location = Location.objects.create(
        point=point,
        source=source,
        captured_at=captured_at
    )
    return location
