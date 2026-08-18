import sys
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.gis.geos import MultiPolygon, Polygon

from apps.accounts.models import User, UserPreferences
from apps.geography.models import AdministrativeArea
from apps.authorities.models import Department, Authority, OfficerProfile
from apps.surplus.models import Category

class Command(BaseCommand):
    help = "Seeds local administrative boundaries, municipal departments, surplus categories, and test user credentials."

    def handle(self, *args, **options):
        self.stdout.write("Initializing Swachsahyog demo database seeding...")

        try:
            with transaction.atomic():
                # 1. Seed AdministrativeArea tree (State > District > ULB > Wards)
                # We define a broad MultiPolygon bounding box covering Indian subcontinent coordinates to act as containment
                poly = Polygon(((70.0, 10.0), (70.0, 35.0), (95.0, 35.0), (95.0, 10.0), (70.0, 10.0)))
                mpoly = MultiPolygon(poly)

                state, _ = AdministrativeArea.objects.get_or_create(
                    name="Demo State",
                    area_type="state",
                    defaults={"boundary": mpoly}
                )
                district, _ = AdministrativeArea.objects.get_or_create(
                    name="Demo District",
                    area_type="district",
                    parent=state,
                    defaults={"boundary": mpoly}
                )
                ulb, _ = AdministrativeArea.objects.get_or_create(
                    name="Demo Municipal Corporation",
                    area_type="ulb",
                    parent=district,
                    defaults={"boundary": mpoly}
                )
                ward24, _ = AdministrativeArea.objects.get_or_create(
                    name="Ward 24",
                    area_type="ward",
                    parent=ulb,
                    defaults={"boundary": mpoly}
                )
                ward25, _ = AdministrativeArea.objects.get_or_create(
                    name="Ward 25",
                    area_type="ward",
                    parent=ulb,
                    defaults={"boundary": mpoly}
                )
                self.stdout.write(self.style.SUCCESS("Seeded Administrative Areas tree (State -> District -> ULB -> Wards)."))

                # 2. Seed Department ("Sanitation")
                department, _ = Department.objects.get_or_create(
                    code="SANITATION",
                    defaults={"name": "Sanitation Department"}
                )
                self.stdout.write(self.style.SUCCESS("Seeded Municipal Department: Sanitation."))

                # 3. Seed Authority per seeded Ward
                auth24, _ = Authority.objects.get_or_create(
                    department=department,
                    administrative_area=ward24
                )
                auth25, _ = Authority.objects.get_or_create(
                    department=department,
                    administrative_area=ward25
                )
                self.stdout.write(self.style.SUCCESS("Seeded Authorities for Ward 24 and Ward 25."))

                # 4. Seed 6 surplus.Category rows matching Browse Categories
                categories = [
                    ("Books & Stationery", "book"),
                    ("Furniture", "chair"),
                    ("Electronics", "laptop"),
                    ("Clothes & Accessories", "shirt"),
                    ("Home & Kitchen", "home"),
                    ("Others", "grid")
                ]
                for cat_name, icon in categories:
                    Category.objects.get_or_create(
                        name=cat_name,
                        defaults={"icon": icon}
                    )
                self.stdout.write(self.style.SUCCESS("Seeded 6 SURPLUS category rows."))

                # 5. Seed Test Citizen User
                citizen, citizen_created = User.objects.get_or_create(
                    username="citizen_user",
                    defaults={
                        "email": "citizen@swachsahyog.in",
                        "phone": "+919876543210",
                        "role": "citizen"
                    }
                )
                if citizen_created:
                    citizen.set_password("citizen123")
                    citizen.save()
                    UserPreferences.objects.get_or_create(user=citizen)
                    self.stdout.write(self.style.SUCCESS("Created test citizen user."))
                else:
                    self.stdout.write("Test citizen user already exists.")

                # 6. Seed Test Officer User + OfficerProfile linked to Department/Ward
                officer, officer_created = User.objects.get_or_create(
                    username="officer_user",
                    defaults={
                        "email": "officer@swachsahyog.in",
                        "phone": "+919876543211",
                        "role": "officer"
                    }
                )
                if officer_created:
                    officer.set_password("officer123")
                    officer.save()
                    UserPreferences.objects.get_or_create(user=officer)

                    # Create Officer Profile assigning officer to Sanitation in Ward 24
                    OfficerProfile.objects.get_or_create(
                        user=officer,
                        defaults={
                            "department": department,
                            "jurisdiction": ward24,
                            "role_title": "Ward Sanitation Officer"
                        }
                    )
                    self.stdout.write(self.style.SUCCESS("Created test officer user and profile."))
                else:
                    self.stdout.write("Test officer user already exists.")

            self.stdout.write(self.style.SUCCESS("\nDemo data seeding completed successfully!"))
            self.stdout.write("\n=========================================")
            self.stdout.write("Test Credentials (printed to console):")
            self.stdout.write("-----------------------------------------")
            self.stdout.write("1. Citizen User:")
            self.stdout.write("   - Username: citizen_user")
            self.stdout.write("   - Password: citizen123")
            self.stdout.write("2. Officer User:")
            self.stdout.write("   - Username: officer_user")
            self.stdout.write("   - Password: officer123")
            self.stdout.write("=========================================\n")

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Seeding failed: {e}"))
            sys.exit(1)
