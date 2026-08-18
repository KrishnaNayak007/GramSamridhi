from django.urls import path
from .views import (
    CitizenReportListView,
    CitizenReportDetailView,
    CivicIncidentListView,
    CivicIncidentDetailView
)
from apps.workflow.views import AssignIncidentView, TransitionIncidentStatusView

app_name = 'incidents'

urlpatterns = [
    # Citizen Reports
    path('reports/', CitizenReportListView.as_view(), name='report-list'),
    path('reports/<uuid:pk>/', CitizenReportDetailView.as_view(), name='report-detail'),
    
    # Civic Incidents
    path('incidents/', CivicIncidentListView.as_view(), name='incident-list'),
    path('incidents/<uuid:pk>/', CivicIncidentDetailView.as_view(), name='incident-detail'),
    path('incidents/<uuid:pk>/assign/', AssignIncidentView.as_view(), name='incident-assign'),
    path('incidents/<uuid:pk>/status/', TransitionIncidentStatusView.as_view(), name='incident-status'),
]
