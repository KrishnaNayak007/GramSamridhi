from rest_framework import serializers
from .models import Evidence

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ['id', 'storage_key', 'media_type', 'captured_at', 'uploaded_at', 'status', 'checksum']
        read_only_fields = ['id', 'storage_key', 'media_type', 'uploaded_at', 'status', 'checksum']

class EvidenceUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    checksum = serializers.CharField(required=False, max_length=64)
    captured_at = serializers.DateTimeField(required=False, allow_null=True)
