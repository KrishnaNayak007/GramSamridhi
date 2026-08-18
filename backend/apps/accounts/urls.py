from django.urls import path
from .views import (
    UserMeView,
    UserPreferencesView,
    ChangePasswordView,
    SecuritySessionsView,
    TwoFactorView
)

app_name = 'accounts'

urlpatterns = [
    path('me/', UserMeView.as_view(), name='me'),
    path('preferences/', UserPreferencesView.as_view(), name='preferences'),
    path('security/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('security/sessions/', SecuritySessionsView.as_view(), name='sessions_list'),
    path('security/sessions/<uuid:pk>/', SecuritySessionsView.as_view(), name='session_revoke'),
    path('security/2fa/<str:action>/', TwoFactorView.as_view(), name='two_factor'),
]
