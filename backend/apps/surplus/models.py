from django.db import models
from core.models import BaseModel
from django.conf import settings

class Category(BaseModel):
    """
    Taxonomy categories for surplus reuse items (e.g., Furniture, Clothes, Electronics).
    """
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Listing(BaseModel):
    """
    Marketplace listing for items being given away or sold for reuse.
    """
    CONDITION_CHOICES = (
        ('new', 'Brand New'),
        ('gently_used', 'Gently Used'),
        ('heavily_used', 'Heavily Used'),
    )
    
    TYPE_CHOICES = (
        ('give_away', 'Free Giveaway'),
        ('for_sale', 'For Sale'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('sold_transferred', 'Sold / Transferred'),
        ('completed_donated', 'Completed / Donated'),
        ('inactive_expired', 'Inactive / Expired'),
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings'
    )
    title = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='listings'
    )
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    listing_type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    location = models.ForeignKey(
        'geography.Location',
        on_delete=models.PROTECT,
        related_name='listings'
    )
    photos = models.ManyToManyField(
        'evidence.Evidence',
        related_name='listing_photos',
        blank=True
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active', db_index=True)

    def __str__(self):
        return f"{self.title} ({self.listing_type}) - Status: {self.status}"

class ListingEvent(BaseModel):
    """
    Tracks analytical events occurred on a Listing (views, reservations, donations).
    """
    EVENT_CHOICES = (
        ('viewed', 'Viewed'),
        ('reserved', 'Reserved'),
        ('donated', 'Donated'),
        ('shared', 'Shared'),
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='events',
        db_index=True
    )
    event_type = models.CharField(max_length=15, choices=EVENT_CHOICES)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='listing_actions'
    )

    def __str__(self):
        return f"Event {self.event_type} on Listing {self.listing.id}"
