from django.test import TestCase
from django.contrib.gis.geos import Point
from django.utils import timezone
from apps.geography.models import AdministrativeArea, Location
from apps.geography.selectors import (
    get_administrative_areas,
    get_location_by_id,
    get_administrative_area_by_id
)
from core.exceptions import ObjectNotFoundError

class GeographySelectorTests(TestCase):
    def setUp(self):
        self.state = AdministrativeArea.objects.create(
            name="Karnataka",
            area_type="STATE"
        )
        self.ward = AdministrativeArea.objects.create(
            name="Ward 100",
            area_type="WARD",
            parent=self.state
        )
        self.location = Location.objects.create(
            point=Point(77.5946, 12.9716, srid=4326),
            source="GPS",
            captured_at=timezone.now()
        )

    def test_get_administrative_areas_all(self):
        """Verifies selector retrieves all administrative areas."""
        areas = get_administrative_areas()
        self.assertEqual(areas.count(), 2)

    def test_get_administrative_areas_filtered(self):
        """Verifies selector retrieves only specified area types."""
        wards = get_administrative_areas(area_type="WARD")
        self.assertEqual(wards.count(), 1)
        self.assertEqual(wards.first().name, "Ward 100")

    def test_get_location_by_id_success(self):
        """Verifies selector successfully fetches Location by ID."""
        fetched = get_location_by_id(str(self.location.id))
        self.assertEqual(fetched.id, self.location.id)

    def test_get_location_by_id_not_found(self):
        """Verifies selector raises ObjectNotFoundError for invalid UUIDs."""
        invalid_uuid = "00000000-0000-0000-0000-000000000000"
        with self.assertRaises(ObjectNotFoundError):
            get_location_by_id(invalid_uuid)

    def test_get_administrative_area_by_id_success(self):
        """Verifies selector fetches AdministrativeArea by ID."""
        fetched = get_administrative_area_by_id(str(self.ward.id))
        self.assertEqual(fetched.id, self.ward.id)
