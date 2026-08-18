from datetime import timedelta
from django.utils import timezone
from django.contrib.gis.measure import D
from apps.incidents.models import CivicIncident, CitizenReport

def find_matching_incident(
    report: CitizenReport, 
    radius_meters: float = 50.0, 
    time_window_hours: float = 48.0
) -> CivicIncident | None:
    """
    Looks for an existing CivicIncident matching the category, spatial radius, and time threshold
    of the submitted CitizenReport.
    """
    time_threshold = timezone.now() - timedelta(hours=time_window_hours)
    
    # Filter active incidents matching category and status
    queryset = CivicIncident.objects.filter(
        category=report.incident.category if report.incident else report.description,  # Or pass category directly
        status__in=['reported', 'open', 'assigned', 'in_progress'],
        last_reported_at__gte=time_threshold
    )
    
    # If the category is passed or inferred:
    category = getattr(report, 'category', None)
    if not category:
        # Fallback category (e.g. if we set category directly on report later)
        category = 'garbage_accumulation'

    queryset = CivicIncident.objects.filter(
        category=category,
        status__in=['reported', 'open', 'assigned', 'in_progress'],
        last_reported_at__gte=time_threshold
    )

    # Perform PostGIS ST_DWithin query on the geography point field
    matched_incident = queryset.filter(
        representative_location__point__dwithin=(report.location.point, D(m=radius_meters))
    ).first()

    return matched_incident
