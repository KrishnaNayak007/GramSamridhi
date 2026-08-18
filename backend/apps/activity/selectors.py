from django.utils import timezone
from apps.incidents.selectors import list_incidents
from apps.surplus.selectors import list_listings

def list_combined_activity(*, user, filters: dict = None) -> list:
    """
    Composes a read-only feed of incidents and listings activities.
    Rule 3: No direct model imports. Calls selectors only.
    """
    filters = filters or {}
    domain = filters.get('domain') # swc | surplus
    
    activity_feed = []

    # 1. Fetch incidents activity
    if not domain or domain == 'swc':
        incidents = list_incidents(user=user)
        for inc in incidents:
            activity_feed.append({
                "id": str(inc.id),
                "domain": "swc",
                "activity_type": "incident",
                "title": f"Incident Reported: {inc.category}",
                "status": inc.status,
                "timestamp": inc.last_reported_at,
                "location": {
                    "lat": inc.representative_location.point.y,
                    "lon": inc.representative_location.point.x
                }
            })

    # 2. Fetch listings activity
    if not domain or domain == 'surplus':
        listings = list_listings(user=user)
        for lst in listings:
            activity_feed.append({
                "id": str(lst.id),
                "domain": "surplus",
                "activity_type": "listing",
                "title": f"Item Available: {lst.title}",
                "status": lst.status,
                "timestamp": lst.created_at,
                "location": {
                    "lat": lst.location.point.y,
                    "lon": lst.location.point.x
                }
            })

    # Sort combined activity feed by timestamp descending
    activity_feed.sort(key=lambda x: x['timestamp'], reverse=True)
    return activity_feed

def get_activity_stats(*, user) -> dict:
    """
    Retrieves high-level counts of incidents and listings.
    """
    incidents_count = list_incidents(user=user).count()
    listings_count = list_listings(user=user).count()

    return {
        "total_swc_incidents": incidents_count,
        "total_surplus_listings": listings_count,
    }
