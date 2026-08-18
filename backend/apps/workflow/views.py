from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .serializers import AssignIncidentInputSerializer, TransitionStatusInputSerializer, AssignmentSerializer, StatusHistorySerializer
from .services import assign_incident, transition_incident_status
from apps.incidents.selectors import get_incident
from apps.accounts.models import User

class AssignIncidentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        # 1. Fetch incident (automatically checks jurisdiction for officers via Rule 10)
        incident = get_incident(user=request.user, incident_id=pk)
        
        serializer = AssignIncidentInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Get target officer
        officer_id = serializer.validated_data['officer_id']
        try:
            officer = User.objects.get(id=officer_id)
        except User.DoesNotExist:
            raise ValidationError({"officer_id": "Target officer user not found."})

        # 3. Perform assignment
        assignment = assign_incident(
            incident=incident,
            officer=officer,
            assigned_by=request.user
        )

        return Response(AssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)

class TransitionIncidentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        # 1. Fetch incident (checks jurisdiction via Rule 10)
        incident = get_incident(user=request.user, incident_id=pk)

        serializer = TransitionStatusInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Perform workflow status transition
        history = transition_incident_status(
            incident=incident,
            to_status=serializer.validated_data['status'],
            changed_by=request.user,
            note=serializer.validated_data.get('note', '')
        )

        return Response(StatusHistorySerializer(history).data, status=status.HTTP_200_OK)
