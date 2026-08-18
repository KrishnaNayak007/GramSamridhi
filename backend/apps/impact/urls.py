from django.urls import path
from .views import ImpactOverviewView

app_name = 'impact'

urlpatterns = [
    path('', ImpactOverviewView.as_view(), name='impact-overview'),
]
