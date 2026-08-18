import os
import django

from django.contrib.gis.geos import MultiPolygon, Polygon
from apps.geography.models import AdministrativeArea
from apps.accounts.models import User
from apps.authorities.models import Department, OfficerProfile

# Setup Django environment
base_dir = os.path.dirname(os.path.abspath(__file__))
env_file = os.path.join(base_dir, '.env')
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                try:
                    key, val = line.strip().split('=', 1)
                    val = val.strip('\'"')
                    os.environ[key] = val
                except ValueError:
                    pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()


def seed():
    print("Seeding administrative area database...")
    
    # India bounding polygon (Longitudes 60.0 to 100.0, Latitudes 5.0 to 40.0)
    poly = Polygon(((60.0, 5.0), (60.0, 40.0), (100.0, 40.0), (100.0, 5.0), (60.0, 5.0)))
    boundary_geom = MultiPolygon(poly)
    
    # 1. Create parent ULB (Urban Local Body)
    ulb, _ = AdministrativeArea.objects.get_or_create(
        name="XYZ Nagar Nigam",
        area_type="ULB",
        defaults={"boundary": boundary_geom}
    )
    
    # 2. Create Ward 24 nested under ULB
    ward, created = AdministrativeArea.objects.get_or_create(
        name="Ward 24, XYZ Nagar Nigam",
        area_type="WARD",
        parent=ulb,
        defaults={"boundary": boundary_geom}
    )
    
    if created:
        print(f"Successfully seeded: {ward}")
    else:
        print(f"Ward already exists: {ward}")

    # 3. Seed Authorities Departments
    print("Seeding municipal departments...")
    sanitation_dept, _ = Department.objects.get_or_create(
        code="SANITATION",
        defaults={"name": "Sanitation Department"}
    )
    print(f"Department seeded: {sanitation_dept}")

    # 4. Seed Officer User (Mahi Sharma)
    print("Seeding Mahi Sharma officer user...")
    officer_user, user_created = User.objects.get_or_create(
        username="mahi_sharma",
        defaults={
            "email": "mahi.sharma@xyz.gov.in",
            "first_name": "Mahi",
            "last_name": "Sharma",
            "role": "officer",
            "is_staff": True
        }
    )
    if user_created:
        officer_user.set_password("mahi123")
        officer_user.save()
        print(f"Created user: {officer_user.username}")
    else:
        print(f"User already exists: {officer_user.username}")

    # 5. Create OfficerProfile linking Mahi Sharma to Ward 24 Sanitation Department
    officer_profile, profile_created = OfficerProfile.objects.get_or_create(
        user=officer_user,
        defaults={
            "department": sanitation_dept,
            "jurisdiction": ward,
            "role_title": "Ward Sanitation Officer"
        }
    )
    if profile_created:
        print(f"Created officer profile: {officer_profile}")
    else:
        print(f"Officer profile already exists: {officer_profile}")

if __name__ == "__main__":
    seed()
