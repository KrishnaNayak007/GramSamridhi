from rest_framework import serializers
from .models import Assignment, StatusHistory
from apps.accounts.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    officer = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'officer', 'assigned_at', 'assigned_by']
        read_only_fields = fields

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)

    class Meta:
        model = StatusHistory
        fields = ['id', 'from_status', 'to_status', 'changed_by', 'changed_at', 'note']
        read_only_fields = fields

class AssignIncidentInputSerializer(serializers.Serializer):
    officer_id = serializers.UUIDField(required=True)

class TransitionStatusInputSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=20, required=True)
    note = serializers.CharField(max_length=1000, required=False, allow_blank=True, default='')
