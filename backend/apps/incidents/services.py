from django.db import transaction, IntegrityError
from django.utils import timezone
from django.contrib.gis.geos import Point
from rest_framework.exceptions import ValidationError

from .models import CitizenReport, CivicIncident
from apps.geography.models import Location
from apps.geography.services import resolve_administrative_area
from apps.evidence.models import Evidence
from apps.authorities.models import Authority, Department
from apps.aggregation.selectors import find_matching_incident
from apps.prioritization.services import calculate_priority_score

@transaction.atomic
def submit_citizen_report(
    *,
    citizen,
    evidence_id: str,
    latitude: float,
    longitude: float,
    description: str = "",
    client_uuid: str = None,
    category: str = "garbage_accumulation"
) -> CitizenReport:
    """
    Ingests and processes a new citizen complaint report.
    Steps:
    1. Verify client_uuid for idempotency.
    2. Create Location and resolve containments.
    3. Group into an existing incident (spatial aggregation) or create a new one.
    4. Automatically calculate/update the priority assessment score.
    5. Trigger synchronous AI analyses.
    """
    # 1. Idempotency Check
    if client_uuid:
        existing_report = CitizenReport.objects.filter(client_uuid=client_uuid).first()
        if existing_report:
            return existing_report

    # 2. Get Evidence
    try:
        evidence = Evidence.objects.get(id=evidence_id)
    except (Evidence.DoesNotExist, ValueError):
        raise ValidationError({"evidence_id": "Invalid evidence reference."})

    # 3. Create Location
    point = Point(longitude, latitude, srid=4326)
    location = Location.objects.create(
        point=point,
        source='GPS',
        captured_at=evidence.captured_at or timezone.now()
    )

    # 4. Resolve Containing Administrative Ward
    ward = resolve_administrative_area(point)
    if not ward:
        raise ValidationError({"location": "Coordinates must fall within a registered municipal boundary."})

    # 5. Create CitizenReport skeleton
    try:
        report = CitizenReport.objects.create(
            citizen=citizen,
            evidence=evidence,
            location=location,
            description=description,
            client_uuid=client_uuid
        )
        # Attach temporary attribute for aggregation helper
        report.category = category
    except IntegrityError:
        raise ValidationError({"client_uuid": "A report with this submission ID already exists."})

    # 6. Spatial Aggregation: Check for nearby incident matching category/time threshold
    matched_incident = find_matching_incident(report)
    now = timezone.now()

    if matched_incident:
        # Link to existing incident
        report.incident = matched_incident
        report.save()
        
        matched_incident.citizen_report_count += 1
        matched_incident.last_reported_at = now
        matched_incident.save()
        
        incident = matched_incident
    else:
        # Resolve responsible local Authority (e.g. Sanitation in Ward 24)
        from apps.authorities.services import CATEGORY_TO_DEPARTMENT_MAP
        dep_code = CATEGORY_TO_DEPARTMENT_MAP.get(category.lower(), 'SANITATION')
        department = Department.objects.filter(code=dep_code).first()
        
        authority = None
        if department:
            authority = Authority.objects.filter(department=department, administrative_area=ward).first()
            if not authority and ward.parent:
                # Fallback to parent ULB level authority
                authority = Authority.objects.filter(department=department, administrative_area=ward.parent).first()

        # Create new CivicIncident aggregation
        incident = CivicIncident.objects.create(
            administrative_area=ward,
            authority=authority,
            category=category,
            status='reported',
            representative_location=location,
            citizen_report_count=1,
            first_reported_at=now,
            last_reported_at=now
        )
        report.incident = incident
        report.save()

    # 7. Recalculate incident priority
    calculate_priority_score(incident)

    # 8. Synchronous AI Analysis Execution (if configured)
    # We will trigger the ai_analysis service inline for the MVP
    try:
        from apps.ai_analysis.services import analyze_report_evidence
        analyze_report_evidence(report=report)
        # Recalculate priority again to absorb severity updates
        calculate_priority_score(incident)
    except Exception as e:
        print("Inline AI analysis failed:", e)

    # 9. Audit log entry
    try:
        from apps.audit.services import log_action
        log_action(
            actor=citizen,
            action="submit_report",
            target_type="CitizenReport",
            target_id=str(report.id),
            metadata={"incident_id": str(incident.id)}
        )
    except Exception as e:
        print("Audit logging failed:", e)

    return report
