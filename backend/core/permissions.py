from rest_framework import permissions

class IsCitizen(permissions.BasePermission):
    """
    Allows access only to authenticated users with a citizen profile.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'citizen'
        )

class IsAuthorityUser(permissions.BasePermission):
    """
    Allows access only to authenticated users with an authority officer/staff role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'officer'
        )

class IsAssignedOfficerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow assigned officers to edit.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check if the incident has active assignments for this user
        if hasattr(obj, 'assignments'):
            return obj.assignments.filter(officer=request.user).exists()

        # Fallback checking assigned_officer directly
        assigned_officer = getattr(obj, 'assigned_officer', None)
        if assigned_officer is not None:
            return assigned_officer == request.user

        # Fallback checking owner/citizen directly
        owner = getattr(obj, 'owner', None) or getattr(obj, 'citizen', None)
        if owner is not None:
            return owner == request.user

        return False
