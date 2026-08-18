from rest_framework import serializers
from .models import AdministrativeArea, Location

class AdministrativeAreaSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = AdministrativeArea
        fields = ['id', 'name', 'area_type', 'parent', 'parent_name']

class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['id', 'source', 'captured_at', 'latitude', 'longitude']

    def get_latitude(self, obj):
        return obj.point.y

    def get_longitude(self, obj):
        return obj.point.x

class CoordinateInputSerializer(serializers.Serializer):
    lat = serializers.FloatField(min_value=-90.0, max_value=90.0)
    lon = serializers.FloatField(min_value=-180.0, max_value=180.0)
