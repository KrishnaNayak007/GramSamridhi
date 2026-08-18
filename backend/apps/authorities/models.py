from django.db import models
from core.models import BaseModel
from django.conf import settings

class Department(BaseModel):
    """
    Municipal departments responsible for handling specific complaint categories (e.g. Sanitation, Water).
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True, db_index=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Authority(BaseModel):
    """
    Represents the department assignment covering a specific administrative area/boundary (e.g. Sanitation in Ward 24).
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='authorities')
    administrative_area = models.ForeignKey(
        'geography.AdministrativeArea',
        on_delete=models.CASCADE,
        related_name='authorities',
        db_index=True
    )

    class Meta:
        unique_together = ('department', 'administrative_area')
        verbose_name_plural = 'Authorities'

    def __str__(self):
        return f"{self.department.name} - {self.administrative_area.name}"

class OfficerProfile(BaseModel):
    """
    Profile extension for authority users containing their department assignment and geographic jurisdiction.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='officer_profile'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='officers'
    )
    # The administrative boundary (Ward or ULB) this officer is assigned to
    jurisdiction = models.ForeignKey(
        'geography.AdministrativeArea',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_officers',
        db_index=True
    )
    role_title = models.CharField(max_length=100, default='Municipal Officer')

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.role_title} ({self.department.name})"
