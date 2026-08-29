from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .services import classify_waste_image

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
            result = classify_waste_image(image_file)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
