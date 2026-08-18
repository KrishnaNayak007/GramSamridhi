from django.urls import path
from .views import (
    ActivityListView,
    ActivityStatsView,
    ActivityBreakdownView,
    ActivityExportView
)

app_name = 'activity'

urlpatterns = [
    path('', ActivityListView.as_view(), name='activity-list'),
    path('stats/', ActivityStatsView.as_view(), name='activity-stats'),
    path('breakdown/', ActivityBreakdownView.as_view(), name='activity-breakdown'),
    path('export/', ActivityExportView.as_view(), name='activity-export'),
]
