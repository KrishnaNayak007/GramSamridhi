from datetime import timedelta
from django.utils import timezone
from django.contrib.gis.measure import D
from apps.incidents.models import CivicIncident, CitizenReport
from apps.geography.services import resolve_administrative_area

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
    
    # 1. Resolve category from report attributes (no fallback to free-text description)
    category = getattr(report, 'category', None)
    if not category and report.evidence:
        ai_res = report.evidence.ai_analysis_results.first()
        if ai_res:
            category = ai_res.category
    if not category and report.incident:
        category = report.incident.category
        
    if not category:
        category = 'MIXED_WASTE'

    # 2. Resolve containing administrative area / ward
    ward = getattr(report, 'ward', None)
    if not ward:
        ward = resolve_administrative_area(report.location.point)

    filter_kwargs = {
        'category': category,
        'status__in': ['reported', 'open', 'assigned', 'in_progress'],
        'last_reported_at__gte': time_threshold
    }
    if ward:
        filter_kwargs['administrative_area'] = ward

    queryset = CivicIncident.objects.filter(**filter_kwargs)
    
    # 3. Perform PostGIS ST_DWithin query on the geography point field
    matched_incident = queryset.filter(
        representative_location__point__dwithin=(report.location.point, D(m=radius_meters))
    ).first()

    return matched_incident
