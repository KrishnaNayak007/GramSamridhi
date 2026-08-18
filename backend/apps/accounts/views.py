from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserSerializer,
    PreferencesSerializer,
    SessionSerializer,
    ChangePasswordSerializer,
    TokenObtainPairWithSessionSerializer
)
from .selectors import get_preferences, list_sessions
from .services import update_preferences, change_password, revoke_session

class TokenObtainPairWithSessionView(TokenObtainPairView):
    """
    Subclasses SimpleJWT's TokenObtainPairView to write active sessions.
    """
    serializer_class = TokenObtainPairWithSessionSerializer

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preferences = get_preferences(user=request.user)
        serializer = PreferencesSerializer(preferences)
        return Response(serializer.data)

    def patch(self, request):
        serializer = PreferencesSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        preferences = update_preferences(user=request.user, data=serializer.validated_data)
        return Response(PreferencesSerializer(preferences).data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password']
        )
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

class SecuritySessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = list_sessions(user=request.user)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        revoke_session(user=request.user, session_id=pk)
        return Response({"message": "Session revoked successfully."}, status=status.HTTP_204_NO_CONTENT)

class TwoFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, action=None):
        if action not in ('enable', 'disable'):
            return Response({"error": "Invalid action. Choose enable or disable."}, status=status.HTTP_400_BAD_REQUEST)
        # Mock 2FA toggles
        return Response({"status": "success", "message": f"2FA has been successfully {action}d."})
