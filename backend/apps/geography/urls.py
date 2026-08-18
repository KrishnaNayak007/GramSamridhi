from django.urls import path
from .views import AdministrativeAreaListView, CoordinateResolutionView

app_name = 'geography'

urlpatterns = [
    path('areas/', AdministrativeAreaListView.as_view(), name='area-list'),
    path('administrative-areas/', AdministrativeAreaListView.as_view(), name='administrative-areas-list'),
    path('resolve/', CoordinateResolutionView.as_view(), name='coordinate-resolve'),
]
