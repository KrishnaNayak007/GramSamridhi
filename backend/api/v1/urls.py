from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import TokenObtainPairWithSessionView

app_name = 'api_v1'

urlpatterns = [
    # Auth JWT flows (Register, Login, Refresh, Logout)
    path('auth/', include('apps.accounts.auth_urls', namespace='auth')),

    # Modular apps routing
    path('accounts/', include('apps.accounts.urls', namespace='accounts')),
    path('geography/', include('apps.geography.urls', namespace='geography')),
    path('evidence/', include('apps.evidence.urls', namespace='evidence')),
    
    # Reports & Incidents (both resolved in incidents urls)
    path('', include('apps.incidents.urls', namespace='incidents')),
    
    # Surplus reuse
    path('surplus/', include('apps.surplus.urls', namespace='surplus')),
    
    # Read-only feeds and impact metrics
    path('activity/', include('apps.activity.urls', namespace='activity')),
    path('impact/', include('apps.impact.urls', namespace='impact')),
    
    # Messaging
    path('messages/', include('apps.messaging.urls', namespace='messaging')),
    
    # Dashboard (officer analytics & map pins)
    path('dashboard/', include('apps.analytics.urls', namespace='dashboard')),

    # Agriculture / Crop residue support
    path('agriculture/', include('apps.agriculture.urls', namespace='agriculture')),

    # Waste Classification Agent API
    path('waste/', include('apps.waste_app.urls', namespace='waste')),

    # Chatbot / Ask GramSamridhi API
    path('chat/', include('apps.chatbot.urls', namespace='chatbot')),
]
