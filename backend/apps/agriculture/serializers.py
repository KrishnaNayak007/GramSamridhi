from rest_framework import serializers
from .models import ResiduePickupRequest, GovernmentScheme, FarmerComplaint

class ResiduePickupRequestSerializer(serializers.ModelSerializer):
    farmer_username = serializers.ReadOnlyField(source='farmer.username')

    class Meta:
        model = ResiduePickupRequest
        fields = [
            'id', 'farmer', 'farmer_username', 'residue_type', 'weight_kg',
            'location_address', 'scheduled_slot', 'status', 
            'payment_amount', 'payment_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'farmer', 'status', 'payment_amount', 'payment_status', 'created_at', 'updated_at']


class GovernmentSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentScheme
        fields = [
            'id', 'name', 'code', 'category', 'description', 
            'benefits', 'eligibility', 'apply_url', 'is_active', 'created_at', 'updated_at'
        ]


class FarmerComplaintSerializer(serializers.ModelSerializer):
    farmer_username = serializers.ReadOnlyField(source='farmer.username')

    class Meta:
        model = FarmerComplaint
        fields = [
            'id', 'farmer', 'farmer_username', 'title', 'category', 
            'description', 'status', 'response_resolution', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'farmer', 'status', 'response_resolution', 'created_at', 'updated_at']
