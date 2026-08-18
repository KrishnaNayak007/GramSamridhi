from django.urls import path
from .views import (
    CategoryListView,
    ListingListView,
    ListingDetailView,
    ListingEventCreateView,
    SurplusMonthlyStatsView,
    SurplusImpactStatsView,
    SurplusActivityStatsView
)

app_name = 'surplus'

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('listings/', ListingListView.as_view(), name='listings-list'),
    path('listings/<uuid:pk>/', ListingDetailView.as_view(), name='listings-detail'),
    path('listings/<uuid:pk>/events/', ListingEventCreateView.as_view(), name='listings-events'),
    path('stats/monthly/', SurplusMonthlyStatsView.as_view(), name='stats-monthly'),
    path('impact/', SurplusImpactStatsView.as_view(), name='impact'),
    path('activity/', SurplusActivityStatsView.as_view(), name='activity'),
]
