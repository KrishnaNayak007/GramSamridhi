from apps.incidents.selectors import list_reports
from apps.surplus.selectors import get_impact_stats

def get_user_impact(*, user) -> dict:
    """
    Composes impact statistics for a user.
    Rule 3: Invokes incidents and surplus selectors only. No direct model imports.
    """
    # 1. SWC (Incidents) Impact
    citizen_reports = list_reports(user=user)
    total_reports = citizen_reports.count()
    resolved_reports = citizen_reports.filter(incident__status='resolved').count()

    # 2. Surplus Impact
    surplus_impact = get_impact_stats(user=user)

    return {
        "swc": {
            "total_reports_filed": total_reports,
            "resolved_reports_count": resolved_reports,
            "community_cleanup_points": resolved_reports * 10 # 10 pts per resolved ticket
        },
        "surplus": surplus_impact
    }
