from rest_framework import serializers
from .models import CitizenReport, CivicIncident
from apps.geography.serializers import LocationSerializer, AdministrativeAreaSerializer
from apps.evidence.serializers import EvidenceSerializer
from apps.accounts.serializers import UserSerializer

class CivicIncidentSerializer(serializers.ModelSerializer):
    representative_location = LocationSerializer(read_only=True)
    administrative_area = AdministrativeAreaSerializer(read_only=True)
    priority_score = serializers.SerializerMethodField()

    class Meta:
        model = CivicIncident
        fields = [
            'id', 'administrative_area', 'authority', 'category', 'status',
            'representative_location', 'citizen_report_count', 'priority_score',
            'first_reported_at', 'last_reported_at'
        ]
        read_only_fields = fields

    def get_priority_score(self, obj) -> float:
        # Fetch the latest assessment score
        latest = obj.priority_assessments.order_by('-calculated_at').first()
        return latest.score if latest else 0.0

class CitizenReportSerializer(serializers.ModelSerializer):
    citizen = UserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    evidence = EvidenceSerializer(read_only=True)
    incident = CivicIncidentSerializer(read_only=True)

    class Meta:
        model = CitizenReport
        fields = ['id', 'citizen', 'evidence', 'location', 'incident', 'description', 'submitted_at', 'client_uuid']
        read_only_fields = fields

class ReportSubmitSerializer(serializers.Serializer):
    evidence_id = serializers.UUIDField(required=True)
    latitude = serializers.FloatField(min_value=-90.0, max_value=90.0, required=True)
    longitude = serializers.FloatField(min_value=-180.0, max_value=180.0, required=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    client_uuid = serializers.UUIDField(required=False, allow_null=True)
    category = serializers.CharField(required=False, default='garbage_accumulation')
