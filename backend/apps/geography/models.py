from django.contrib.gis.db import models as gis_models
from django.db import models
from core.models import BaseModel

class AdministrativeArea(BaseModel):
    """
    Self-referential tree representing regional/municipal boundaries (State -> District -> ULB -> Ward).
    """
    AREA_TYPES = (
        ('STATE', 'State'),
        ('DISTRICT', 'District'),
        ('SUBDISTRICT', 'Subdistrict / Tehsil'),
        ('BLOCK', 'Development Block'),
        ('PANCHAYAT', 'Gram Panchayat'),
        ('VILLAGE', 'Village'),
        ('ULB_CORP', 'Municipal Corporation'),
        ('ULB_MUNI', 'Municipality'),
        ('ULB_NAC', 'NAC / Town'),
        ('WARD', 'Ward'),
    )

    name = models.CharField(max_length=255)
    area_type = models.CharField(max_length=20, choices=AREA_TYPES, db_index=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
        db_index=True
    )
    # PostGIS boundary representation (MultiPolygon geography mapping)
    boundary = gis_models.MultiPolygonField(geography=True, srid=4326, null=True, blank=True)

    class Meta:
        unique_together = ('parent', 'name', 'area_type')

    def __str__(self):
        return f"{self.name} ({self.get_area_type_display()})"

class Location(BaseModel):
    """
    Stores precise geospatial coordinates where a report was captured or manually placed.
    """
    SOURCES = (
        ('GPS', 'Device GPS Sensor'),
        ('MANUAL', 'Manual Address Picker'),
    )

    # PostGIS point geography (WGS 84 SRID 4326)
    point = gis_models.PointField(geography=True, srid=4326)
    source = models.CharField(max_length=10, choices=SOURCES, default='GPS')
    captured_at = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"Location: Point({self.point.x}, {self.point.y}) via {self.source}"
