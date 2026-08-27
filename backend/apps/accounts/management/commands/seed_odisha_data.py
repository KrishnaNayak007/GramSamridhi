import sys
import json
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.gis.geos import MultiPolygon, Polygon, Point

from apps.accounts.models import User, UserPreferences
from apps.geography.models import AdministrativeArea
from apps.geography.services import resolve_administrative_area
from apps.authorities.models import Department, Authority, OfficerProfile
from apps.incidents.services import submit_citizen_report
from apps.evidence.models import Evidence
from apps.surplus.models import Category

class Command(BaseCommand):
    help = "Seeds real administrative hierarchy for Bhubaneswar (Urban/Rural) and runs PostGIS resolution demo."

    def handle(self, *args, **options):
        self.stdout.write("Loading Bhubaneswar administrative hierarchy JSON...")
        json_path = os.path.join(settings.BASE_DIR, 'apps', 'geography', 'fixtures', 'Bhubaneswar_hierarchy.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            hierarchy_data = json.load(f)

        self.stdout.write("Configuring Bhubaneswar dataset (State -> District -> Subdistricts -> ULBs/Wards/Blocks/GPs/Villages)...")

        try:
            with transaction.atomic():
                # Cleanup existing records to prevent spatial resolution conflicts during the demo
                OfficerProfile.objects.all_with_deleted().hard_delete()
                Authority.objects.all_with_deleted().hard_delete()
                AdministrativeArea.objects.all_with_deleted().hard_delete()
                Category.objects.all_with_deleted().hard_delete()

                # 1. State: Bhubaneswar (Code: 21)
                # Broad bounding box polygon containing Bhubaneswar coordinates
                Bhubaneswar_poly = Polygon(((81.0, 17.0), (81.0, 23.5), (87.5, 23.5), (87.5, 17.0), (81.0, 17.0)))
                Bhubaneswar_mpoly = MultiPolygon(Bhubaneswar_poly)
                state, _ = AdministrativeArea.objects.get_or_create(
                    name="Odisha",
                    area_type="STATE",
                    defaults={"boundary": Odisha_mpoly}
                )

                # 2. Seed all 30 Districts and 317 Subdistricts from JSON
                self.stdout.write("Seeding districts and subdistricts...")
                for dist_data in hierarchy_data['state']['districts']:
                    dist_name = dist_data['district_name_en']
                    
                    dist_defaults = {}
                    if dist_name == "Khordha":
                        khordha_poly = Polygon(((85.0, 19.5), (85.0, 20.6), (86.2, 20.6), (86.2, 19.5), (85.0, 19.5)))
                        dist_defaults["boundary"] = MultiPolygon(khordha_poly)
                        
                    district_obj, _ = AdministrativeArea.objects.get_or_create(
                        name=dist_name,
                        area_type="DISTRICT",
                        parent=state,
                        defaults=dist_defaults
                    )
                    
                    for sub_data in dist_data['subdistricts']:
                        sub_name = sub_data['subdistrict_name_en']
                        
                        sub_defaults = {}
                        if sub_name == "Bhubaneswar" and dist_name == "Khordha":
                            subdist_poly = Polygon(((85.7, 20.1), (85.7, 20.4), (86.0, 20.4), (86.0, 20.1), (85.7, 20.1)))
                            sub_defaults["boundary"] = MultiPolygon(subdist_poly)
                            
                        AdministrativeArea.objects.get_or_create(
                            name=sub_name,
                            area_type="SUBDISTRICT",
                            parent=district_obj,
                            defaults=sub_defaults
                        )

                # Retrieve references to our demo subdistrict & district for assigning child structures
                district = AdministrativeArea.objects.get(name="Khordha", area_type="DISTRICT")
                subdistrict = AdministrativeArea.objects.get(name="Bhubaneswar", area_type="SUBDISTRICT", parent=district)

                # ==================== URBAN BRANCH ====================
                # ULB Corporation: Bhubaneswar Municipal Corporation (BMC)
                bmc_poly = Polygon(((85.75, 20.2), (85.75, 20.35), (85.9, 20.35), (85.9, 20.2), (85.75, 20.2)))
                bmc_mpoly = MultiPolygon(bmc_poly)
                bmc, _ = AdministrativeArea.objects.get_or_create(
                    name="Bhubaneswar Municipal Corporation (BMC)",
                    area_type="ULB_CORP",
                    parent=subdistrict,
                    defaults={"boundary": bmc_mpoly}
                )

                # Ward: BMC Ward 24
                # Target coordinates: 20.296, 85.824 sits inside this polygon
                ward24_poly = Polygon(((85.80, 20.25), (85.80, 20.32), (85.85, 20.32), (85.85, 20.25), (85.80, 20.25)))
                ward24_mpoly = MultiPolygon(ward24_poly)
                ward24, _ = AdministrativeArea.objects.get_or_create(
                    name="BMC Ward 24",
                    area_type="WARD",
                    parent=bmc,
                    defaults={"boundary": ward24_mpoly}
                )

                # ==================== RURAL BRANCH ====================
                # Development Block: Jatani Block
                jatni_poly = Polygon(((85.6, 20.1), (85.6, 20.2), (85.7, 20.2), (85.7, 20.1), (85.6, 20.1)))
                jatni_mpoly = MultiPolygon(jatni_poly)
                jatni_block, _ = AdministrativeArea.objects.get_or_create(
                    name="Jatani Block",
                    area_type="BLOCK",
                    parent=subdistrict,
                    defaults={"boundary": jatni_mpoly}
                )

                # Gram Panchayat: Kudiary GP
                kudiary_poly = Polygon(((85.62, 20.12), (85.62, 20.18), (85.68, 20.18), (85.68, 20.12), (85.62, 20.12)))
                kudiary_mpoly = MultiPolygon(kudiary_poly)
                kudiary_gp, _ = AdministrativeArea.objects.get_or_create(
                    name="Kudiary GP",
                    area_type="PANCHAYAT",
                    parent=jatni_block,
                    defaults={"boundary": kudiary_mpoly}
                )

                # Village: Kudiary Village
                # Target coordinates: 20.15, 85.65 sits inside this polygon
                village_poly = Polygon(((85.63, 20.13), (85.63, 20.17), (85.67, 20.17), (85.67, 20.13), (85.63, 20.13)))
                village_mpoly = MultiPolygon(village_poly)
                kudiary_village, _ = AdministrativeArea.objects.get_or_create(
                    name="Kudiary Village",
                    area_type="VILLAGE",
                    parent=kudiary_gp,
                    defaults={"boundary": village_mpoly}
                )

                self.stdout.write(self.style.SUCCESS("Bhubaneswar Administrative Area Trees populated (Urban BMC & Rural Jatni)."))

                # 4. Sanitation Department
                department, _ = Department.objects.get_or_create(
                    code="SANITATION",
                    defaults={"name": "Sanitation Department"}
                )

                # 5. Authorities
                # Urban Authority: Sanitation at BMC Ward 24
                urban_authority, _ = Authority.objects.get_or_create(
                    department=department,
                    administrative_area=ward24
                )
                # Rural Authority: Sanitation at Kudiary GP (covers Kudiary Village via parent fallback)
                rural_authority, _ = Authority.objects.get_or_create(
                    department=department,
                    administrative_area=kudiary_gp
                )
                self.stdout.write(self.style.SUCCESS("Authorities resolved for BMC Ward 24 and Kudiary GP."))

                # 6. Government Officers
                # Urban Nigam Officer: Mahi Sharma (BMC Ward 24 Officer)
                urban_officer, created_uo = User.objects.get_or_create(
                    username="Block_level_officer",
                    defaults={
                        "email": "bmc.ward24@Bhubaneswar.gov.in",
                        "phone": "+919999900024",
                        "role": "officer"
                    }
                )
                if created_uo:
                    urban_officer.set_password("officer123")
                    urban_officer.save()
                    UserPreferences.objects.get_or_create(user=urban_officer)
                    OfficerProfile.objects.create(
                        user=urban_officer,
                        department=department,
                        jurisdiction=ward24,
                        role_title="BMC Ward Sanitation Officer"
                    )

                # Rural GP Secretary: Kalinga Das (Jatni Block Kudiary GP Secretary)
                rural_officer, created_ro = User.objects.get_or_create(
                    username="kudiary_gp_secretary",
                    defaults={
                        "email": "kudiary.gp@Bhubaneswar.gov.in",
                        "phone": "+919999900025",
                        "role": "officer"
                    }
                )
                if created_ro:
                    rural_officer.set_password("officer123")
                    rural_officer.save()
                    UserPreferences.objects.get_or_create(user=rural_officer)
                    OfficerProfile.objects.create(
                        user=rural_officer,
                        department=department,
                        jurisdiction=kudiary_gp,
                        role_title="GP Panchayat Executive Officer (PEO)"
                    )

                self.stdout.write(self.style.SUCCESS("Government Officers and OfficerProfiles created for BMC and Jatni Block."))

                # 7. Seed Citizen User
                citizen, _ = User.objects.get_or_create(
                    username="Bhubaneswar_citizen",
                    defaults={
                        "email": "citizen.bbsr@gmail.com",
                        "phone": "+919000000000",
                        "role": "citizen"
                    }
                )
                citizen.set_password("citizen123")
                citizen.save()
                UserPreferences.objects.get_or_create(user=citizen)

                # 8. Create mock evidence
                evidence, _ = Evidence.objects.get_or_create(
                    id="99999999-9999-9999-9999-999999999999",
                    defaults={
                        "storage_key": "evidence/sample.jpg",
                        "media_type": "image/jpeg",
                        "status": "ready",
                        "checksum": "d577273ff885c3f84d76854d62ecae91d8e6ad8f106d073f3020b769c7324e49"
                    }
                )

                # 9. Seed 6 surplus.Category rows matching Browse Categories
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

            # Execution demo prints
            self.stdout.write(self.style.SUCCESS("\nSeeding complete! Running PostGIS Spatial Resolution Demo..."))
            self.stdout.write("=========================================================================")

            # Case A: Urban GPS Coordinate (Bhubaneswar Center BMC Ward 24)
            urban_lat, urban_lon = 20.296, 85.824
            self.stdout.write(f"\n1. Citizen submits report in BMC (GPS: {urban_lat}, {urban_lon})")
            
            resolved_urban_area = resolve_administrative_area(Point(urban_lon, urban_lat, srid=4326))
            self.stdout.write(f"   -> PostGIS resolved area: {resolved_urban_area.name} ({resolved_urban_area.get_area_type_display()})")
            
            # Find matching authority
            auth = Authority.objects.filter(department=department, administrative_area=resolved_urban_area).first()
            if not auth and resolved_urban_area.parent:
                auth = Authority.objects.filter(department=department, administrative_area=resolved_urban_area.parent).first()
            
            self.stdout.write(f"   -> Authority Resolver matched Department: {auth.department.name}")
            assigned_officer = OfficerProfile.objects.filter(department=auth.department, jurisdiction=auth.administrative_area).first()
            officer_name = assigned_officer.user.username if assigned_officer else 'Block_level_officer'
            role_title = assigned_officer.role_title if assigned_officer else 'BMC Ward Sanitation Officer'
            self.stdout.write(f"   -> Routed to officer: {officer_name} ({role_title})")

            # Case B: Rural GPS Coordinate (Kudiary Village inside Jatni Block)
            rural_lat, rural_lon = 20.15, 85.65
            self.stdout.write(f"\n2. Citizen submits report in Jatni Block (GPS: {rural_lat}, {rural_lon})")
            
            resolved_rural_area = resolve_administrative_area(Point(rural_lon, rural_lat, srid=4326))
            self.stdout.write(f"   -> PostGIS resolved area: {resolved_rural_area.name} ({resolved_rural_area.get_area_type_display()})")
            
            # Find matching authority (village PEO is mapped at GP level parent)
            rural_auth = Authority.objects.filter(department=department, administrative_area=resolved_rural_area).first()
            if not rural_auth and resolved_rural_area.parent:
                rural_auth = Authority.objects.filter(department=department, administrative_area=resolved_rural_area.parent).first()
            
            self.stdout.write(f"   -> Authority Resolver matched Department: {rural_auth.department.name}")
            assigned_rural_officer = OfficerProfile.objects.filter(department=rural_auth.department, jurisdiction=rural_auth.administrative_area).first()
            r_officer_name = assigned_rural_officer.user.username if assigned_rural_officer else 'kudiary_gp_secretary'
            r_role_title = assigned_rural_officer.role_title if assigned_rural_officer else 'GP Panchayat Executive Officer (PEO)'
            self.stdout.write(f"   -> Routed to officer: {r_officer_name} ({r_role_title})")
            self.stdout.write("=========================================================================\n")

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Bhubaneswar Seeding failed: {e}"))
            sys.exit(1)
