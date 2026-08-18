from django.test import TestCase
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.utils import timezone
from apps.geography.models import AdministrativeArea, Location
from apps.geography.services import create_location, resolve_administrative_area
from core.exceptions import ValidationError

class GeographyServiceTests(TestCase):
    def setUp(self):
        # Create standard test polygons for wards
        # Ward A is a 2x2 square in coordinates (0,0) to (2,2)
        poly_a = Polygon(((0.0, 0.0), (0.0, 2.0), (2.0, 2.0), (2.0, 0.0), (0.0, 0.0)))
        self.ward_a = AdministrativeArea.objects.create(
            name="Ward A",
            area_type="WARD",
            boundary=MultiPolygon(poly_a)
        )

        # Ward B is a 2x2 square located further away at (10,10) to (12,12)
        poly_b = Polygon(((10.0, 10.0), (10.0, 12.0), (12.0, 12.0), (12.0, 10.0), (10.0, 10.0)))
        self.ward_b = AdministrativeArea.objects.create(
            name="Ward B",
            area_type="WARD",
            boundary=MultiPolygon(poly_b)
        )

    def test_create_location_success(self):
        """Verifies Location creation persists coordinates correctly."""
        captured_time = timezone.now()
        location = create_location(
            latitude=12.9716,
            longitude=77.5946,
            source='GPS',
            captured_at=captured_time
        )
        self.assertIsNotNone(location.id)
        self.assertEqual(location.source, 'GPS')
        self.assertEqual(location.point.x, 77.5946)  # Longitude
        self.assertEqual(location.point.y, 12.9716)  # Latitude

    def test_create_location_invalid_coords(self):
        """Verifies latitude/longitude bound restrictions raise validation errors."""
        with self.assertRaises(ValidationError):
            create_location(latitude=95.0, longitude=77.5)
        
        with self.assertRaises(ValidationError):
            create_location(latitude=12.0, longitude=190.0)

    def test_resolve_ward_contains(self):
        """Verifies coordinate query inside Ward polygon resolves directly."""
        point = Point(1.0, 1.0, srid=4326)  # Inside Ward A
        resolved = resolve_administrative_area(point)
        self.assertIsNotNone(resolved)
        self.assertEqual(resolved.id, self.ward_a.id)
        self.assertEqual(resolved.name, "Ward A")

    def test_resolve_ward_distance_fallback(self):
        """Verifies coordinate query outside boundaries falls back to the nearest ward center."""
        point = Point(3.0, 3.0, srid=4326)  # Outside both, but closer to Ward A than Ward B
        resolved = resolve_administrative_area(point)
        self.assertIsNotNone(resolved)
        # Closer to Ward A (distance ~ 1.4 units) than Ward B (distance ~ 9.8 units)
        self.assertEqual(resolved.id, self.ward_a.id)
        self.assertEqual(resolved.name, "Ward A")
