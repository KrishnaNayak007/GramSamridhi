from django.utils import timezone
from django.db import transaction
from apps.incidents.models import CivicIncident
from .models import PriorityAssessment

@transaction.atomic
def calculate_priority_score(incident: CivicIncident) -> PriorityAssessment:
    """
    Calculates and appends a priority score for a CivicIncident.
    Score factors:
    - Report Count: 10 points per report, capped at 40.
    - AI Severity: LOW = 10, MEDIUM = 30, HIGH = 50. Defaults to 20 if no analysis exists.
    - Time Elapsed: 1 point per hour since first reported, capped at 10.
    """
    # 1. Report count factor
    report_count = incident.citizen_report_count
    report_factor = min(report_count * 10, 40)

    # 2. Severity factor (lookup from AI analysis on reports evidence)
    severity_factor = 20
    severity_label = "UNKNOWN"
    
    # Get first report to check AI analysis results
    first_report = incident.reports.select_related('evidence').first()
    if first_report and hasattr(first_report.evidence, 'ai_analysis_results'):
        ai_result = first_report.evidence.ai_analysis_results.first()
        if ai_result:
            severity_label = ai_result.severity.upper()
            if severity_label == "LOW":
                severity_factor = 10
            elif severity_label == "MEDIUM":
                severity_factor = 30
            elif severity_label == "HIGH":
                severity_factor = 50

    # 3. Time elapsed factor
    now = timezone.now()
    hours_elapsed = (now - incident.first_reported_at).total_seconds() / 3600.0
    time_factor = min(int(hours_elapsed), 10)

    total_score = report_factor + severity_factor + time_factor
    factor_breakdown = {
        "report_count": report_count,
        "report_factor": report_factor,
        "severity": severity_label,
        "severity_factor": severity_factor,
        "hours_elapsed": round(hours_elapsed, 1),
        "time_factor": time_factor
    }

    # Append new PriorityAssessment record
    assessment = PriorityAssessment.objects.create(
        incident=incident,
        score=total_score,
        factor_breakdown=factor_breakdown
    )

    return assessment
