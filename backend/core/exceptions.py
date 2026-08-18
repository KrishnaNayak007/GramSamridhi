from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

class ApplicationError(Exception):
    """Base exception class for all custom domain errors."""
    def __init__(self, message, extra=None):
        super().__init__(message)
        self.message = message
        self.extra = extra or {}

class ObjectNotFoundError(ApplicationError):
    """Raised when a specific domain entity could not be found."""
    pass

class ValidationError(ApplicationError):
    """Raised when business logic invariants or parameters fail validation."""
    pass

class PermissionDeniedError(ApplicationError):
    """Raised when authorization checks fail for a specific user action."""
    pass

def custom_exception_handler(exc, context):
    """
    Translates Django, DRF, and custom Swachsahyog ApplicationErrors into structured JSON problem responses.
    """
    # Call DRF's default exception handler first to get the standard response.
    response = exception_handler(exc, context)

    # 1. Translate custom ApplicationError subclasses to HTTP Responses
    if isinstance(exc, ObjectNotFoundError):
        return Response({
            'error': 'object_not_found',
            'message': exc.message,
            'details': exc.extra
        }, status=status.HTTP_404_NOT_FOUND)

    elif isinstance(exc, ValidationError):
        return Response({
            'error': 'validation_error',
            'message': exc.message,
            'details': exc.extra
        }, status=status.HTTP_400_BAD_REQUEST)

    elif isinstance(exc, PermissionDeniedError):
        return Response({
            'error': 'permission_denied',
            'message': exc.message,
            'details': exc.extra
        }, status=status.HTTP_403_FORBIDDEN)

    # 2. Handle standard Django ValidationErrors (translating them to HTTP 400)
    elif isinstance(exc, DjangoValidationError):
        return Response({
            'error': 'validation_error',
            'message': 'Django database validation failed.',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
        }, status=status.HTTP_400_BAD_REQUEST)

    # 3. Format standard DRF errors for consistency
    if response is not None:
        # If it's a DRF ValidationError, reshape details
        if isinstance(exc, DRFValidationError):
            return Response({
                'error': 'validation_error',
                'message': 'Input payload validation failed.',
                'details': response.data
            }, status=response.status_code)

        # Standard DRF exceptions
        response.data = {
            'error': getattr(exc, 'default_code', 'error'),
            'message': response.data.get('detail', str(exc)),
            'details': response.data
        }

    return response
