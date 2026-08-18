from django.contrib import admin
from .models import Conversation, Message

class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'related_listing', 'created_at']

class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'created_at', 'read_at']
    list_filter = ['created_at']

admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)
