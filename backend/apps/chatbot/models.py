from django.db import models

class ChatLog(models.Model):
    PERSONA_CHOICES = [
        ('krishi', 'KrishiSahyog'),
        ('swachh', 'SwachhSahyog'),
    ]

    user_id = models.CharField(max_length=100)
    persona = models.CharField(max_length=10, choices=PERSONA_CHOICES, default='swachh')
    location = models.CharField(max_length=150, blank=True, null=True)
    
    user_message = models.TextField()
    bot_response = models.TextField()
    tool_used = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_persona_display()}] {self.user_id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"