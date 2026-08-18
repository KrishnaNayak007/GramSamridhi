import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .selectors import list_combined_activity, get_activity_stats

class ActivityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        domain = request.query_params.get('domain')
        filters = {'domain': domain} if domain in ('swc', 'surplus') else {}
        feed = list_combined_activity(user=request.user, filters=filters)
        return Response(feed)

class ActivityStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = get_activity_stats(user=request.user)
        return Response(stats)

class ActivityBreakdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        domain = request.query_params.get('domain', 'swc')
        filters = {'domain': domain}
        feed = list_combined_activity(user=request.user, filters=filters)
        
        # Group activity feed by status for breakdown
        breakdown = {}
        for item in feed:
            status = item['status']
            breakdown[status] = breakdown.get(status, 0) + 1

        return Response({
            "domain": domain,
            "breakdown": breakdown,
            "total_records": len(feed)
        })

class ActivityExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        domain = request.query_params.get('domain')
        filters = {'domain': domain} if domain in ('swc', 'surplus') else {}
        feed = list_combined_activity(user=request.user, filters=filters)

        # Generate CSV payload
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="swachsahyog_activity.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Domain', 'Activity Type', 'Title', 'Status', 'Timestamp', 'Lat', 'Lon'])
        
        for item in feed:
            writer.writerow([
                item['id'],
                item['domain'],
                item['activity_type'],
                item['title'],
                item['status'],
                item['timestamp'].isoformat() if hasattr(item['timestamp'], 'isoformat') else item['timestamp'],
                item['location']['lat'],
                item['location']['lon']
            ])
            
        return response
