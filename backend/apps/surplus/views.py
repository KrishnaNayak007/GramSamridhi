from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    CategorySerializer,
    ListingSerializer,
    ListingCreateInputSerializer,
    ListingEventInputSerializer
)
from .selectors import (
    list_categories,
    list_listings,
    get_listing,
    get_monthly_stats,
    get_impact_stats
)
from .services import create_listing, record_listing_event

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = list_categories()
        return Response(CategorySerializer(categories, many=True).data)

class ListingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filters = {
            'category': request.query_params.get('category'),
            'listing_type': request.query_params.get('listing_type'),
            'near': request.query_params.get('near'),
            'radius': request.query_params.get('radius', 10.0)
        }
        listings = list_listings(user=request.user, filters=filters)
        return Response(ListingSerializer(listings, many=True).data)

    def post(self, request):
        serializer = ListingCreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        listing = create_listing(
            owner=request.user,
            title=serializer.validated_data['title'],
            category_id=serializer.validated_data['category_id'],
            condition=serializer.validated_data['condition'],
            listing_type=serializer.validated_data['listing_type'],
            price=serializer.validated_data.get('price'),
            description=serializer.validated_data.get('description', ''),
            latitude=serializer.validated_data['latitude'],
            longitude=serializer.validated_data['longitude'],
            photo_ids=serializer.validated_data.get('photo_ids')
        )
        return Response(ListingSerializer(listing).data, status=status.HTTP_201_CREATED)

class ListingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        listing = get_listing(user=request.user, listing_id=pk)
        return Response(ListingSerializer(listing).data)

class ListingEventCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        serializer = ListingEventInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = record_listing_event(
            listing_id=pk,
            event_type=serializer.validated_data['event_type'],
            actor=request.user
        )
        return Response({"status": "success", "event_id": str(event.id)}, status=status.HTTP_201_CREATED)

class SurplusMonthlyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = get_monthly_stats(user=request.user)
        return Response(stats)

class SurplusImpactStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = get_impact_stats(user=request.user)
        return Response(stats)

class SurplusActivityStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Activity: claimed listings and interactions compiled for dashboard
        stats = get_monthly_stats(user=request.user)
        return Response(stats)
