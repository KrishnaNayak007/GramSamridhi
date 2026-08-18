from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import EvidenceUploadSerializer, EvidenceSerializer
from .services import create_evidence, confirm_evidence

class EvidenceUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = EvidenceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        evidence = create_evidence(
            file_obj=serializer.validated_data['file'],
            checksum=serializer.validated_data.get('checksum'),
            captured_at=serializer.validated_data.get('captured_at')
        )
        
        return Response(EvidenceSerializer(evidence).data, status=status.HTTP_201_CREATED)

class EvidenceConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        evidence = confirm_evidence(evidence_id=pk)
        return Response(EvidenceSerializer(evidence).data, status=status.HTTP_200_OK)
