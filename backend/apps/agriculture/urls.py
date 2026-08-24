from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResiduePickupViewSet, GovernmentSchemeViewSet, FarmerComplaintViewSet, AIFarmingAssistantView

app_name = 'agriculture'

router = DefaultRouter()
router.register('pickups', ResiduePickupViewSet, basename='pickup')
router.register('schemes', GovernmentSchemeViewSet, basename='scheme')
router.register('complaints', FarmerComplaintViewSet, basename='complaint')

urlpatterns = [
    path('', include(router.urls)),
    path('ai-assistant/', AIFarmingAssistantView.as_view(), name='ai_assistant'),
]
