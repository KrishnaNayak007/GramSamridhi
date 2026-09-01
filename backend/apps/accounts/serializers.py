from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserPreferences, UserSession
from .services import create_session

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id', 'username', 'role']

class PreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        exclude = ['id', 'user', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ['id', 'ip_address', 'user_agent', 'last_active']
        read_only_fields = ['id', 'ip_address', 'user_agent', 'last_active']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

class TokenObtainPairWithSessionSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token Serializer that intercepts token generation to create a UserSession tracking record.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Decode refresh token to get JTI claim
        refresh_token = RefreshToken(data['refresh'])
        jti = refresh_token['jti']
        
        request = self.context.get('request')
        ip_address = None
        user_agent = None
        
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT')

        # Create session record linking user agent and IP to JTI
        create_session(
            user=self.user,
            jti=jti,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Include user profile in token response
        data['user'] = UserSerializer(self.user).data

        return data
