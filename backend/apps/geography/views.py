from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Point
from rest_framework.permissions import AllowAny

from .serializers import AdministrativeAreaSerializer, CoordinateInputSerializer
from .selectors import get_administrative_areas
from .services import resolve_administrative_area
from core.exceptions import ValidationError

class AdministrativeAreaListView(ListAPIView):
    """
    API endpoint to list administrative areas, filterable by area_type query param.
    """
    serializer_class = AdministrativeAreaSerializer
    permission_classes = [AllowAny]  # Open reference list for onboarding/location picking

    def get_queryset(self):
        area_type = self.request.query_params.get('area_type', None)
        return get_administrative_areas(area_type=area_type)

class CoordinateResolutionView(APIView):
    """
    API endpoint to resolve a latitude/longitude point to the containing WARD.
    """
    permission_classes = [AllowAny]  # Open resolution API for reports submission/lookup

    def get(self, request, *args, **kwargs):
        # 1. Validate query parameters
        input_serializer = CoordinateInputSerializer(data=request.query_params)
        if not input_serializer.is_valid():
            raise ValidationError("Invalid coordinates query params.", input_serializer.errors)

        lat = input_serializer.validated_data['lat']
        lon = input_serializer.validated_data['lon']

        # 2. Build Point geometry
        point = Point(lon, lat, srid=4326)

        # 3. Resolve Ward
        resolved_ward = resolve_administrative_area(point)

        if not resolved_ward:
            return Response({
                'resolved': False,
                'message': 'No containing or nearby ward found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # 4. Resolve routing jurisdiction details
        category = request.query_params.get('category', 'garbage_accumulation')
        from apps.authorities.services import resolve_responsible_officer
        officer = resolve_responsible_officer(resolved_ward, category)

        responsible_dept = None
        assigned_officer = None

        if officer:
            responsible_dept = {
                'name': officer.department.name,
                'code': officer.department.code
            }
            assigned_officer = {
                'name': officer.user.get_full_name() or officer.user.username,
                'role_title': officer.role_title
            }
        else:
            # Fallback if no officer is matched
            from apps.authorities.models import Department
            dept = Department.objects.filter(code='SANITATION').first()
            if dept:
                responsible_dept = {
                    'name': dept.name,
                    'code': dept.code
                }

        # 5. Serialize and return resolved ward and routing details
        output_serializer = AdministrativeAreaSerializer(resolved_ward)
        return Response({
            'resolved': True,
            'ward': output_serializer.data,
            'responsible_department': responsible_dept,
            'assigned_officer': assigned_officer
        }, status=status.HTTP_200_OK)
