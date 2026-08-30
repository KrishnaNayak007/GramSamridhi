from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from apps.evidence.services import create_evidence
from .tasks import classify_waste_image_task

class WasteClassificationView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image') or request.FILES.get('file')
        if not image_file:
            return Response(
                {"error": "An image file is required under the key 'image' or 'file'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Persist the uploaded image/evidence first
            evidence = create_evidence(file_obj=image_file)

            # 2. Call the Celery task asynchronously
            classify_waste_image_task.delay(str(evidence.id))

            # 3. Return 202 Accepted immediately
            return Response(
                {
                    "evidence_id": str(evidence.id),
                    "status": "queued"
                },
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
