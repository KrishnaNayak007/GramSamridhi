import uuid
from django.db import models
from django.utils import timezone

class BaseModelQuerySet(models.QuerySet):
    def delete(self):
        """Perform soft delete on queryset."""
        return self.update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        """Perform actual hard database deletion on queryset."""
        return super().delete()

    def active(self):
        """Filter to only non-deleted instances."""
        return self.filter(is_deleted=False)

class BaseModelManager(models.Manager):
    def get_queryset(self):
        """Default queryset excludes soft-deleted items."""
        return BaseModelQuerySet(self.model, using=self._db).active()

    def all_with_deleted(self):
        """Expose all records including soft-deleted ones."""
        return BaseModelQuerySet(self.model, using=self._db)

class BaseModel(models.Model):
    """
    Abstract base model that implements UUID primary key, timestamps, and soft-delete capabilities.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = BaseModelManager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Soft delete the instance."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(using=using, update_fields=['is_deleted', 'deleted_at', 'updated_at'])

    def hard_delete(self, using=None, keep_parents=False):
        """Hard delete the instance from the database."""
        super().delete(using=using, keep_parents=keep_parents)

    def restore(self):
        """Restore a soft-deleted instance."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
