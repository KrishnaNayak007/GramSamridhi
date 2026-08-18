from django.db.models import QuerySet, Q
from .models import CitizenReport, CivicIncident
from apps.accounts.models import User
from core.exceptions import ObjectNotFoundError, PermissionDeniedError

def get_report(*, user: User, report_id: str) -> CitizenReport:
    """
    Retrieves a CitizenReport, validating user ownership / jurisdiction context.
    """
    try:
        report = CitizenReport.objects.select_related('citizen', 'evidence', 'location', 'incident').get(id=report_id)
    except (CitizenReport.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Report with ID {report_id} not found.")

    # Rule 10: Citizens can only read their own reports; officers can read all
    if user.role == 'citizen' and report.citizen != user:
        raise PermissionDeniedError("You do not have permission to view this report.")

    return report

def list_reports(*, user: User) -> QuerySet:
    """
    Lists CitizenReports. Citizens only see their own; officers see all reports in scope.
    """
    queryset = CitizenReport.objects.select_related('citizen', 'evidence', 'location', 'incident').all()
    if user.role == 'citizen':
        queryset = queryset.filter(citizen=user)
    return queryset.order_by('-submitted_at')

def get_incident(*, user: User, incident_id: str) -> CivicIncident:
    """
    Retrieves a CivicIncident, filtering by jurisdiction if requested by an officer.
    """
    try:
        incident = CivicIncident.objects.select_related('administrative_area', 'authority', 'representative_location').get(id=incident_id)
    except (CivicIncident.DoesNotExist, ValueError):
        raise ObjectNotFoundError(f"Incident with ID {incident_id} not found.")

    # Rule 10: Officers filter by jurisdiction (if restricted profile exists)
    if user.role == 'officer':
        profile = getattr(user, 'officer_profile', None)
        if profile and profile.jurisdiction:
            # Check if incident is in the officer's jurisdiction
            jurisdiction = profile.jurisdiction
            areas_in_scope = [jurisdiction.id]
            # Include child areas (nested wards) if jurisdiction is a parent ULB/District
            areas_in_scope.extend(list(jurisdiction.children.values_list('id', flat=True)))
            
            if incident.administrative_area_id not in areas_in_scope:
                raise PermissionDeniedError("This incident lies outside your assigned jurisdiction.")

    return incident

def list_incidents(*, user: User, filters: dict = None) -> QuerySet:
    """
    Lists CivicIncidents. Filters by officer's jurisdiction.
    """
    queryset = CivicIncident.objects.select_related('administrative_area', 'authority', 'representative_location').all()
    filters = filters or {}

    # Rule 10: Officer jurisdiction filters
    if user.role == 'officer':
        profile = getattr(user, 'officer_profile', None)
        if profile and profile.jurisdiction:
            jurisdiction = profile.jurisdiction
            areas_in_scope = [jurisdiction.id]
            areas_in_scope.extend(list(jurisdiction.children.values_list('id', flat=True)))
            queryset = queryset.filter(administrative_area_id__in=areas_in_scope)

    # Apply category/status filters
    category = filters.get('category')
    if category:
        queryset = queryset.filter(category=category)

    status = filters.get('status')
    if status:
        queryset = queryset.filter(status=status)

    return queryset.order_by('-last_reported_at')
