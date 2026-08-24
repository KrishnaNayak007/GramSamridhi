from django.db import models
from django.conf import settings
from core.models import BaseModel
import uuid

class ResiduePickupRequest(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('collected', 'Collected'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
    )

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='residue_pickups'
    )
    residue_type = models.CharField(max_length=100, default='Paddy Straw')
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    location_address = models.TextField()
    scheduled_slot = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')

    class Meta:
        db_table = 'agriculture_residue_pickup'
        ordering = ['-created_at']

    def __str__(self):
        return f"Residue request {self.id} for {self.farmer.username}"


class GovernmentScheme(BaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    benefits = models.TextField()
    eligibility = models.TextField()
    apply_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'agriculture_government_scheme'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class FarmerComplaint(BaseModel):
    CATEGORY_CHOICES = (
        ('collection', 'Collection'),
        ('payment', 'Payment'),
        ('schemes', 'Government Schemes'),
        ('other', 'Other'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('resolved', 'Resolved'),
    )

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_complaints'
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    response_resolution = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'agriculture_farmer_complaint'
        ordering = ['-created_at']

    def __str__(self):
        return f"Complaint {self.id} from {self.farmer.username}"
