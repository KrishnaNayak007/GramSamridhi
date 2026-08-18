from .models import Department, OfficerProfile
from apps.geography.models import AdministrativeArea

# Map complaint/waste categories to municipal department codes
CATEGORY_TO_DEPARTMENT_MAP = {
    'garbage_accumulation': 'SANITATION',
    'mixed_waste': 'SANITATION',
    'overflowing_bin': 'SANITATION',
    'hazardous_waste': 'SANITATION',
    'pothole': 'PUBLIC_WORKS',
    'street_light_out': 'ELECTRICAL',
    'water_overflow': 'WATER_SEWER'
}

def resolve_responsible_officer(ward: AdministrativeArea, category: str) -> OfficerProfile | None:
    """
    Finds the municipal officer responsible for a given Ward and complaint category.
    Falls back to a parent ULB officer if no officer is assigned to the specific Ward.
    """
    if not ward:
        return None

    # 1. Map category string to department code
    # Default fallback to SANITATION if category is not mapped or empty
    dep_code = CATEGORY_TO_DEPARTMENT_MAP.get(category.lower(), 'SANITATION')

    # 2. Get target Department
    try:
        department = Department.objects.get(code=dep_code)
    except Department.DoesNotExist:
        return None

    # 3. Step A: Try to find an officer assigned directly to this Ward
    officer = OfficerProfile.objects.filter(
        department=department,
        jurisdiction=ward
    ).select_related('user').first()

    if officer:
        return officer

    # 4. Step B: Fallback to parent administrative area (e.g. ULB/Nigam) if ward is unassigned
    if ward.parent:
        parent_officer = OfficerProfile.objects.filter(
            department=department,
            jurisdiction=ward.parent
        ).select_related('user').first()
        
        return parent_officer

    return None
