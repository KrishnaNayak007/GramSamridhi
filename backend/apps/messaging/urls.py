from django.urls import path
from .views import ConversationListView, MessageListView

app_name = 'messaging'

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversations-list'),
    path('conversations/<uuid:pk>/messages/', MessageListView.as_view(), name='messages-list'),
]
