from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.incidents.selectors import list_incidents, list_reports
from apps.surplus.selectors import list_listings

class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_reports = list_reports(user=request.user).count()
        active_incidents = list_incidents(user=request.user, filters={'status': 'open'}).count()
        assigned_incidents = list_incidents(user=request.user, filters={'status': 'assigned'}).count()
        surplus_listings = list_listings(user=request.user, filters={'status': 'active'}).count()

        return Response({
            "active_reports": active_reports,
            "active_incidents": active_incidents,
            "assigned_incidents": assigned_incidents,
            "active_surplus_listings": surplus_listings,
        })

class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incidents = list_incidents(user=request.user)
        
        # Categorized counts
        category_breakdown = {}
        status_breakdown = {}
        for inc in incidents:
            category_breakdown[inc.category] = category_breakdown.get(inc.category, 0) + 1
            status_breakdown[inc.status] = status_breakdown.get(inc.status, 0) + 1

        return Response({
            "total_incidents": len(incidents),
            "by_category": category_breakdown,
            "by_status": status_breakdown,
        })

class DashboardMapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Rule 10: Officers see active incidents in their jurisdiction
        incidents = list_incidents(user=request.user)
        # Exclude closed and resolved from map pins
        incidents = incidents.exclude(status__in=('resolved', 'closed'))

        map_pins = []
        for inc in incidents:
            # Fetch latest priority score
            latest_assessment = inc.priority_assessments.order_by('-calculated_at').first()
            priority_score = latest_assessment.score if latest_assessment else 0.0

            map_pins.append({
                "id": str(inc.id),
                "category": inc.category,
                "status": inc.status,
                "priority_score": priority_score,
                "latitude": inc.representative_location.point.y,
                "longitude": inc.representative_location.point.x,
                "citizen_report_count": inc.citizen_report_count,
                "first_reported_at": inc.first_reported_at.isoformat()
            })

        return Response(map_pins)
