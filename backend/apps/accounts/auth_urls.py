from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import TokenObtainPairWithSessionView
from .auth_views import RegisterView, LogoutView

app_name = 'auth'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairWithSessionView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
