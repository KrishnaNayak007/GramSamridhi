from django.urls import path
from .views import WasteClassificationView

app_name = 'waste_app'

urlpatterns = [
    path('classify/', WasteClassificationView.as_view(), name='classify'),
]
