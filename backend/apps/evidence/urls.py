from django.urls import path
from .views import EvidenceUploadView, EvidenceConfirmView

app_name = 'evidence'

urlpatterns = [
    path('', EvidenceUploadView.as_view(), name='upload'),
    path('upload/', EvidenceUploadView.as_view(), name='upload_alias'),
    path('<uuid:pk>/confirm/', EvidenceConfirmView.as_view(), name='confirm'),
]
