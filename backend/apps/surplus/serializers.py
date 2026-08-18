from rest_framework import serializers
from .models import Listing, Category, ListingEvent
from apps.accounts.serializers import UserSerializer
from apps.geography.serializers import LocationSerializer
from apps.evidence.serializers import EvidenceSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']
        read_only_fields = fields

class ListingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    photos = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'owner', 'title', 'category', 'condition', 'listing_type',
            'price', 'description', 'location', 'photos', 'status', 'created_at'
        ]
        read_only_fields = fields

class ListingCreateInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=True)
    category_id = serializers.UUIDField(required=True)
    condition = serializers.ChoiceField(choices=Listing.CONDITION_CHOICES, required=True)
    listing_type = serializers.ChoiceField(choices=Listing.TYPE_CHOICES, required=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    latitude = serializers.FloatField(min_value=-90.0, max_value=90.0, required=True)
    longitude = serializers.FloatField(min_value=-180.0, max_value=180.0, required=True)
    photo_ids = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)

class ListingEventInputSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=ListingEvent.EVENT_CHOICES, required=True)
