from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    CitizenReportSerializer,
    ReportSubmitSerializer,
    CivicIncidentSerializer
)
from .selectors import get_report, list_reports, get_incident, list_incidents
from .services import submit_citizen_report

class CitizenReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = list_reports(user=request.user)
        serializer = CitizenReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReportSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        report = submit_citizen_report(
            citizen=request.user,
            evidence_id=serializer.validated_data['evidence_id'],
            latitude=serializer.validated_data['latitude'],
            longitude=serializer.validated_data['longitude'],
            description=serializer.validated_data.get('description', ''),
            client_uuid=serializer.validated_data.get('client_uuid'),
            category=serializer.validated_data.get('category', 'garbage_accumulation')
        )
        
        return Response(CitizenReportSerializer(report).data, status=status.HTTP_201_CREATED)

class CitizenReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        report = get_report(user=request.user, report_id=pk)
        return Response(CitizenReportSerializer(report).data)

class CivicIncidentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filters = {
            'category': request.query_params.get('category'),
            'status': request.query_params.get('status')
        }
        incidents = list_incidents(user=request.user, filters=filters)
        serializer = CivicIncidentSerializer(incidents, many=True)
        return Response(serializer.data)

class CivicIncidentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        incident = get_incident(user=request.user, incident_id=pk)
        return Response(CivicIncidentSerializer(incident).data)
