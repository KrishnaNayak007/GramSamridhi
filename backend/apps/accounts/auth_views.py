from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.conf import settings

from .models import User, UserPreferences, UserSession
from .services import create_session

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True)
    role = serializers.ChoiceField(choices=(('citizen', 'Citizen'), ('officer', 'Officer')), default='citizen')
    username = serializers.CharField(max_length=150, required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        phone = attrs.get('phone')
        if not email and not phone:
            raise serializers.ValidationError("At least one of email or phone must be provided.")
        return attrs

    def create(self, validated_data):
        email = validated_data.get('email')
        phone = validated_data.get('phone')
        password = validated_data['password']
        role = validated_data.get('role', 'citizen')
        
        username = validated_data.get('username')
        if not username:
            if email:
                username = email.split('@')[0]
            else:
                username = f"user_{phone}"

        # Ensure uniqueness of username
        orig_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{orig_username}_{counter}"
            counter += 1

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email or '',
                phone=phone or '',
                password=password,
                role=role
            )
            # A User must never exist without default UserPreferences
            UserPreferences.objects.create(user=user)
            
        return user

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        jti = refresh['jti']

        # Get client IP and User-Agent
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT')

        # Log session row
        create_session(
            user=user,
            jti=jti,
            ip_address=ip_address,
            user_agent=user_agent
        )

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"refresh": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            jti = token['jti']
            # Blacklist token JTI
            token.blacklist()
            
            # Delete/Revoke corresponding UserSession row so it disappears from the list
            UserSession.objects.filter(jti=jti).delete()
        except Exception as e:
            # Handle token expired or already blacklisted gracefully
            pass

        return Response(status=status.HTTP_204_NO_CONTENT)
