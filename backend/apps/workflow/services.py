from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.incidents.models import CivicIncident
from .models import Assignment, StatusHistory

@transaction.atomic
def assign_incident(*, incident: CivicIncident, officer, assigned_by) -> Assignment:
    """
    Assigns a CivicIncident to a municipal officer.
    Updates the incident status to 'assigned' and records a StatusHistory entry.
    """
    if officer.role != 'officer':
        raise ValidationError({"officer": "User must have an officer role to be assigned incidents."})

    # 1. Create Assignment record
    assignment = Assignment.objects.create(
        incident=incident,
        officer=officer,
        assigned_by=assigned_by
    )

    # 2. Transition status if not already assigned
    if incident.status != 'assigned':
        transition_incident_status(
            incident=incident,
            to_status='assigned',
            changed_by=assigned_by,
            note=f"Incident assigned to {officer.get_full_name() or officer.username}."
        )

    # 3. Log audit entry
    try:
        from apps.audit.services import log_action
        log_action(
            actor=assigned_by,
            action="assign_incident",
            target_type="CivicIncident",
            target_id=str(incident.id),
            metadata={"officer_id": str(officer.id)}
        )
    except Exception as e:
        print("Audit logging failed:", e)

    return assignment

@transaction.atomic
def transition_incident_status(*, incident: CivicIncident, to_status: str, changed_by, note: str = "") -> StatusHistory:
    """
    Transitions the workflow status of a CivicIncident.
    """
    from_status = incident.status
    if from_status == to_status:
        raise ValidationError({"status": f"Incident is already in '{to_status}' status."})

    # Validate valid statuses
    valid_statuses = [choice[0] for choice in CivicIncident.STATUS_CHOICES]
    if to_status not in valid_statuses:
        raise ValidationError({"status": f"Invalid status: {to_status}. Must be one of {valid_statuses}."})

    # Update status on incident
    incident.status = to_status
    incident.save()

    # Record StatusHistory
    history = StatusHistory.objects.create(
        incident=incident,
        from_status=from_status,
        to_status=to_status,
        changed_by=changed_by,
        note=note
    )

    # Trigger notifications
    try:
        from apps.notifications.services import send_notification
        # Notify all citizens who filed reports linked to this incident
        recipients = list(incident.reports.values_list('citizen', flat=True).distinct())
        for r_id in recipients:
            send_notification(
                recipient_id=r_id,
                noti_type="INCIDENT_STATUS_UPDATE",
                payload={
                    "incident_id": str(incident.id),
                    "from_status": from_status,
                    "to_status": to_status,
                    "note": note
                }
            )
    except Exception as e:
        print("Notification dispatch failed:", e)

    return history
