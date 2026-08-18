from django.urls import path
from .views import DashboardOverviewView, DashboardAnalyticsView, DashboardMapView

app_name = 'analytics'

urlpatterns = [
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('map/', DashboardMapView.as_view(), name='dashboard-map'),
]
