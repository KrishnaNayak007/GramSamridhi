from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .selectors import get_user_impact

class ImpactOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        impact = get_user_impact(user=request.user)
        return Response(impact)
