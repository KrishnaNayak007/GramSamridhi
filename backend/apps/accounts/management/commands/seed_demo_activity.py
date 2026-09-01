import os
import uuid
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.gis.geos import Point

from apps.accounts.models import User
from apps.geography.models import AdministrativeArea, Location
from apps.authorities.models import Authority, OfficerProfile
from apps.evidence.models import Evidence
from apps.ai_analysis.models import AIAnalysisResult
from apps.prioritization.models import PriorityAssessment
from apps.incidents.models import CivicIncident, CitizenReport
from apps.agriculture.models import ResiduePickupRequest, FarmerComplaint
from apps.surplus.models import Category, Listing, ListingEvent

class Command(BaseCommand):
    help = "Seeds deterministic, realistic demo activity rows (incidents, reports, evidence, pickups, complaints, and surplus listings) for live demonstrations."

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo activity datasets...")

        try:
            with transaction.atomic():
                now = timezone.now()

                # 1. Fetch referenced actors and geography areas created by seed_odisha_data
                citizen = User.objects.get(username="Bhubaneswar_citizen")
                farmer = User.objects.get(username="devinder_Sahu")
                urban_officer = User.objects.get(username="Block_level_officer")
                rural_officer = User.objects.get(username="kudiary_gp_secretary")

                ward24 = AdministrativeArea.objects.get(name="BMC Ward 24", area_type="WARD")
                kudiary_gp = AdministrativeArea.objects.get(name="Kudiary GP", area_type="PANCHAYAT")
                kudiary_village = AdministrativeArea.objects.get(name="Kudiary Village", area_type="VILLAGE")

                urban_authority = Authority.objects.filter(administrative_area=ward24).first()
                rural_authority = Authority.objects.filter(administrative_area=kudiary_gp).first()

                # =========================================================================
                # 2. SEED CIVIC INCIDENTS + CITIZEN REPORTS + EVIDENCE + AI + PRIORITIZATION
                # =========================================================================
                self.stdout.write("Seeding Civic Incidents, Citizen Reports, AI Analysis, and Priority Assessments...")

                incident_specs = [
                    {
                        "uuid": "11111111-1111-1111-1111-000000000001",
                        "title": "Severe garbage accumulation near Ward 24 market dump",
                        "category": "garbage_accumulation",
                        "severity": "HIGH",
                        "status": "open",
                        "area": ward24,
                        "authority": urban_authority,
                        "point": Point(85.824, 20.296, srid=4326),
                        "days_ago": 3,
                        "confidence": 0.89,
                        "priority_score": 8.4,
                        "detected_objects": ["overflowing_dumpster", "organic_refuse", "plastic_bags"],
                        "factor_breakdown": {"severity": "HIGH", "report_count": 3, "hours_elapsed": 72, "base_score": 8.4}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000002",
                        "title": "Decomposing market vegetable and organic waste heap",
                        "category": "organic_waste",
                        "severity": "MEDIUM",
                        "status": "assigned",
                        "area": ward24,
                        "authority": urban_authority,
                        "point": Point(85.822, 20.298, srid=4326),
                        "days_ago": 5,
                        "confidence": 0.83,
                        "priority_score": 6.5,
                        "detected_objects": ["vegetable_waste", "decomposing_produce"],
                        "factor_breakdown": {"severity": "MEDIUM", "report_count": 2, "hours_elapsed": 120, "base_score": 6.5}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000003",
                        "title": "Single-use plastic waste choking community drainage line",
                        "category": "plastic_waste",
                        "severity": "MEDIUM",
                        "status": "in_progress",
                        "area": ward24,
                        "authority": urban_authority,
                        "point": Point(85.826, 20.294, srid=4326),
                        "days_ago": 8,
                        "confidence": 0.91,
                        "priority_score": 7.1,
                        "detected_objects": ["plastic_bottles", "blocked_drain", "polythene_bags"],
                        "factor_breakdown": {"severity": "MEDIUM", "report_count": 2, "drainage_risk": True, "base_score": 7.1}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000004",
                        "title": "Overflowing secondary waste bin cleared and sanitized",
                        "category": "garbage_accumulation",
                        "severity": "HIGH",
                        "status": "resolved",
                        "area": ward24,
                        "authority": urban_authority,
                        "point": Point(85.823, 20.295, srid=4326),
                        "days_ago": 14,
                        "confidence": 0.94,
                        "priority_score": 7.9,
                        "detected_objects": ["overflowing_bin", "mixed_waste"],
                        "factor_breakdown": {"severity": "HIGH", "resolved": True, "base_score": 7.9}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000005",
                        "title": "Recyclable packaging material collected and segregated",
                        "category": "mixed_recyclables",
                        "severity": "LOW",
                        "status": "closed",
                        "area": ward24,
                        "authority": urban_authority,
                        "point": Point(85.825, 20.297, srid=4326),
                        "days_ago": 22,
                        "confidence": 0.78,
                        "priority_score": 3.6,
                        "detected_objects": ["cardboard_boxes", "metal_cans"],
                        "factor_breakdown": {"severity": "LOW", "report_count": 1, "base_score": 3.6}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000006",
                        "title": "Paddy crop residue piled near irrigation canal",
                        "category": "organic_waste",
                        "severity": "HIGH",
                        "status": "reported",
                        "area": kudiary_village,
                        "authority": rural_authority,
                        "point": Point(85.65, 20.15, srid=4326),
                        "days_ago": 1,
                        "confidence": 0.87,
                        "priority_score": 8.7,
                        "detected_objects": ["paddy_straw_heap", "waterway_proximity"],
                        "factor_breakdown": {"severity": "HIGH", "fire_risk": True, "base_score": 8.7}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000007",
                        "title": "Roadside agricultural litter and discarded bags",
                        "category": "garbage_accumulation",
                        "severity": "MEDIUM",
                        "status": "assigned",
                        "area": kudiary_gp,
                        "authority": rural_authority,
                        "point": Point(85.64, 20.14, srid=4326),
                        "days_ago": 4,
                        "confidence": 0.84,
                        "priority_score": 5.8,
                        "detected_objects": ["roadside_litter", "fertilizer_sacks"],
                        "factor_breakdown": {"severity": "MEDIUM", "report_count": 1, "base_score": 5.8}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000008",
                        "title": "Agricultural biomass and dry stalk heap requiring pickup",
                        "category": "organic_waste",
                        "severity": "MEDIUM",
                        "status": "in_progress",
                        "area": kudiary_village,
                        "authority": rural_authority,
                        "point": Point(85.66, 20.16, srid=4326),
                        "days_ago": 9,
                        "confidence": 0.88,
                        "priority_score": 6.3,
                        "detected_objects": ["dry_biomass", "mustard_stalks"],
                        "factor_breakdown": {"severity": "MEDIUM", "farm_recovery": True, "base_score": 6.3}
                    },
                    {
                        "uuid": "11111111-1111-1111-1111-000000000009",
                        "title": "Bio-waste composting pit cleared and sanitized",
                        "category": "organic_waste",
                        "severity": "LOW",
                        "status": "resolved",
                        "area": kudiary_gp,
                        "authority": rural_authority,
                        "point": Point(85.65, 20.13, srid=4326),
                        "days_ago": 18,
                        "confidence": 0.76,
                        "priority_score": 3.9,
                        "detected_objects": ["compost_residue", "manure_pit"],
                        "factor_breakdown": {"severity": "LOW", "resolved": True, "base_score": 3.9}
                    }
                ]

                for spec in incident_specs:
                    reported_dt = now - timedelta(days=spec["days_ago"])

                    # Location
                    loc, _ = Location.objects.get_or_create(
                        point=spec["point"],
                        defaults={"source": "GPS", "captured_at": reported_dt}
                    )

                    # Evidence
                    evidence_checksum = f"chk-{spec['uuid']}"
                    ev, _ = Evidence.objects.get_or_create(
                        checksum=evidence_checksum,
                        defaults={
                            "storage_key": f"evidence/{spec['uuid']}.jpg",
                            "media_type": "image/jpeg",
                            "status": "confirmed",
                            "captured_at": reported_dt
                        }
                    )

                    # Civic Incident
                    incident, _ = CivicIncident.objects.update_or_create(
                        id=spec["uuid"],
                        defaults={
                            "administrative_area": spec["area"],
                            "authority": spec["authority"],
                            "category": spec["category"],
                            "status": spec["status"],
                            "representative_location": loc,
                            "citizen_report_count": 2 if spec["severity"] == "HIGH" else 1,
                            "first_reported_at": reported_dt,
                            "last_reported_at": reported_dt + timedelta(hours=2)
                        }
                    )

                    # Citizen Report
                    report_client_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"report-{spec['uuid']}")
                    report, _ = CitizenReport.objects.update_or_create(
                        client_uuid=report_client_uuid,
                        defaults={
                            "citizen": citizen,
                            "evidence": ev,
                            "location": loc,
                            "incident": incident,
                            "description": spec["title"],
                            "submitted_at": reported_dt
                        }
                    )

                    # AI Analysis Result
                    AIAnalysisResult.objects.update_or_create(
                        evidence=ev,
                        defaults={
                            "title": spec["title"],
                            "category": spec["category"],
                            "severity": spec["severity"],
                            "detected_objects": spec["detected_objects"],
                            "confidence": spec["confidence"],
                            "raw_response": {"model": "gemini-2.5-flash", "objects": spec["detected_objects"]}
                        }
                    )

                    # Priority Assessment
                    PriorityAssessment.objects.update_or_create(
                        incident=incident,
                        defaults={
                            "score": spec["priority_score"],
                            "factor_breakdown": spec["factor_breakdown"]
                        }
                    )

                self.stdout.write(self.style.SUCCESS(f"Created/Updated {len(incident_specs)} Civic Incidents with complete AI and priority records."))

                # =========================================================================
                # 3. SEED RESIDUE PICKUP REQUESTS (FARMER PIPELINE AT ₹2.15/KG)
                # =========================================================================
                self.stdout.write("\nSeeding Residue Pickup Requests for Farmer Devinder Sahu...")

                RATE_PER_KG = Decimal('2.15')
                pickup_specs = [
                    {
                        "residue_type": "Paddy Straw",
                        "weight_kg": Decimal('1200.00'),
                        "status": "paid",
                        "payment_status": "paid",
                        "location_address": "Farm Plot #14, Kudiary Village, Jatni Block",
                        "scheduled_slot": "2026-08-12 · 09:00 AM",
                        "days_ago": 20
                    },
                    {
                        "residue_type": "Wheat Residue",
                        "weight_kg": Decimal('850.00'),
                        "status": "paid",
                        "payment_status": "paid",
                        "location_address": "Kudiary North Canal Road, Jatni",
                        "scheduled_slot": "2026-08-18 · 10:30 AM",
                        "days_ago": 14
                    },
                    {
                        "residue_type": "Sugarcane Trash",
                        "weight_kg": Decimal('1500.00'),
                        "status": "paid",
                        "payment_status": "paid",
                        "location_address": "Kudiary GP Main Road Plot 3",
                        "scheduled_slot": "2026-08-22 · 08:00 AM",
                        "days_ago": 10
                    },
                    {
                        "residue_type": "Paddy Straw",
                        "weight_kg": Decimal('1100.00'),
                        "status": "paid",
                        "payment_status": "paid",
                        "location_address": "Farm Plot #14, Kudiary Village",
                        "scheduled_slot": "2026-08-26 · 11:00 AM",
                        "days_ago": 6
                    },
                    {
                        "residue_type": "Mustard Stalks",
                        "weight_kg": Decimal('650.00'),
                        "status": "collected",
                        "payment_status": "processing",
                        "location_address": "Kudiary Village East Farm",
                        "scheduled_slot": "2026-08-29 · 09:30 AM",
                        "days_ago": 3
                    },
                    {
                        "residue_type": "Paddy Straw",
                        "weight_kg": Decimal('950.00'),
                        "status": "scheduled",
                        "payment_status": "unpaid",
                        "location_address": "Farm Plot #14, Kudiary Village",
                        "scheduled_slot": "Tomorrow · 08:30 AM",
                        "days_ago": 1
                    },
                    {
                        "residue_type": "Agri Plastic Sheet",
                        "weight_kg": Decimal('400.00'),
                        "status": "pending",
                        "payment_status": "unpaid",
                        "location_address": "Greenhouse Sector 2, Kudiary",
                        "scheduled_slot": "2026-09-04 · 02:00 PM",
                        "days_ago": 0.5
                    },
                    {
                        "residue_type": "Paddy Straw",
                        "weight_kg": Decimal('1350.00'),
                        "status": "pending",
                        "payment_status": "unpaid",
                        "location_address": "Kudiary Village South Boundary",
                        "scheduled_slot": "2026-09-05 · 10:00 AM",
                        "days_ago": 0.2
                    }
                ]

                for p_spec in pickup_specs:
                    p_amount = (p_spec["weight_kg"] * RATE_PER_KG).quantize(Decimal('0.01'))
                    created_dt = now - timedelta(days=float(p_spec["days_ago"]))
                    
                    req, created = ResiduePickupRequest.objects.get_or_create(
                        farmer=farmer,
                        residue_type=p_spec["residue_type"],
                        scheduled_slot=p_spec["scheduled_slot"],
                        defaults={
                            "weight_kg": p_spec["weight_kg"],
                            "payment_amount": p_amount,
                            "location_address": p_spec["location_address"],
                            "status": p_spec["status"],
                            "payment_status": p_spec["payment_status"],
                            "created_at": created_dt
                        }
                    )
                    if not created:
                        req.weight_kg = p_spec["weight_kg"]
                        req.payment_amount = p_amount
                        req.status = p_spec["status"]
                        req.payment_status = p_spec["payment_status"]
                        req.location_address = p_spec["location_address"]
                        req.save()

                self.stdout.write(self.style.SUCCESS(f"Created/Updated {len(pickup_specs)} Residue Pickup Requests."))

                # =========================================================================
                # 4. SEED FARMER COMPLAINTS
                # =========================================================================
                self.stdout.write("\nSeeding Farmer Complaints...")

                farmer_complaints = [
                    {
                        "title": "Delay in scheduled collection vehicle arrival",
                        "category": "collection",
                        "description": "The pickup vehicle was delayed by 3 hours for Paddy Straw lot on Aug 26 due to road maintenance.",
                        "status": "resolved",
                        "response_resolution": "Vehicle rerouted via Jatni bypass road. Route optimized with local driver team."
                    },
                    {
                        "title": "Discrepancy in weight slip verification",
                        "category": "payment",
                        "description": "Weight recorded on receipt was 850kg vs digital farm scale 870kg. Requesting weighbridge verification.",
                        "status": "reviewing",
                        "response_resolution": "PEO reviewing calibration log from weighbridge."
                    },
                    {
                        "title": "SMAM machinery subsidy application status inquiry",
                        "category": "schemes",
                        "description": "Submitted application for Super Straw Management System subsidy under SMAM scheme. Requesting portal update.",
                        "status": "pending",
                        "response_resolution": ""
                    }
                ]

                for fc in farmer_complaints:
                    FarmerComplaint.objects.update_or_create(
                        farmer=farmer,
                        title=fc["title"],
                        defaults={
                            "category": fc["category"],
                            "description": fc["description"],
                            "status": fc["status"],
                            "response_resolution": fc["response_resolution"]
                        }
                    )

                self.stdout.write(self.style.SUCCESS(f"Created/Updated {len(farmer_complaints)} Farmer Complaints."))

                # =========================================================================
                # 5. SEED SURPLUS MARKETPLACE LISTINGS
                # =========================================================================
                self.stdout.write("\nSeeding Surplus Marketplace Listings across 6 Categories...")

                categories_dict = {cat.name: cat for cat in Category.objects.all()}

                surplus_specs = [
                    {
                        "cat_name": "Books & Stationery",
                        "title": "Engineering Mathematics Semester 1 & 2 Textbooks",
                        "condition": "gently_used",
                        "listing_type": "give_away",
                        "price": None,
                        "status": "active",
                        "description": "Complete higher engineering mathematics book by B.S. Grewal. In excellent condition for 1st year engineering students.",
                        "owner": citizen,
                        "point": Point(85.824, 20.296, srid=4326)
                    },
                    {
                        "cat_name": "Furniture",
                        "title": "Solid Wood Study Desk with 2 Drawers",
                        "condition": "gently_used",
                        "listing_type": "for_sale",
                        "price": Decimal('750.00'),
                        "status": "active",
                        "description": "Sturdy teak wood study desk with smooth drawers and polished surface. Perfect for home study or office.",
                        "owner": citizen,
                        "point": Point(85.821, 20.293, srid=4326)
                    },
                    {
                        "cat_name": "Electronics",
                        "title": "Working 10-inch Android Tablet with Charger",
                        "condition": "gently_used",
                        "listing_type": "give_away",
                        "price": None,
                        "status": "active",
                        "description": "Fully functional educational tablet with protective case and charger. Suitable for students attending online classes.",
                        "owner": citizen,
                        "point": Point(85.826, 20.299, srid=4326)
                    },
                    {
                        "cat_name": "Clothes & Accessories",
                        "title": "Winter Woolen Blankets & Warm Jackets (Pack of 3)",
                        "condition": "gently_used",
                        "listing_type": "give_away",
                        "price": None,
                        "status": "completed_donated",
                        "description": "Clean, washed, and sanitized heavy wool blankets and warm jackets donated to community shelter.",
                        "owner": citizen,
                        "point": Point(85.825, 20.295, srid=4326)
                    },
                    {
                        "cat_name": "Home & Kitchen",
                        "title": "Heavy Base Stainless Steel Cookware Set (5 Pots)",
                        "condition": "gently_used",
                        "listing_type": "for_sale",
                        "price": Decimal('320.00'),
                        "status": "active",
                        "description": "Set of 5 heavy bottom stainless steel cooking pots with matching lids. No dents or damage.",
                        "owner": farmer,
                        "point": Point(85.65, 20.15, srid=4326)
                    },
                    {
                        "cat_name": "Others",
                        "title": "Surplus Farm-Fresh Organic Tomatoes (25 kg)",
                        "condition": "new",
                        "listing_type": "give_away",
                        "price": None,
                        "status": "completed_donated",
                        "description": "Fresh harvest surplus organic tomatoes from Kudiary cluster farm shared with community mid-day meal kitchen.",
                        "owner": farmer,
                        "point": Point(85.64, 20.14, srid=4326)
                    },
                    {
                        "cat_name": "Others",
                        "title": "PVC Drip Irrigation Tubing (50 meters)",
                        "condition": "gently_used",
                        "listing_type": "for_sale",
                        "price": Decimal('450.00'),
                        "status": "active",
                        "description": "Excess agricultural drip irrigation lateral pipes with nozzles in working condition without blockages.",
                        "owner": farmer,
                        "point": Point(85.66, 20.16, srid=4326)
                    }
                ]

                for s_spec in surplus_specs:
                    cat = categories_dict.get(s_spec["cat_name"])
                    if not cat:
                        cat, _ = Category.objects.get_or_create(name=s_spec["cat_name"])

                    loc, _ = Location.objects.get_or_create(
                        point=s_spec["point"],
                        defaults={"source": "GPS", "captured_at": now}
                    )

                    listing, created = Listing.objects.update_or_create(
                        owner=s_spec["owner"],
                        title=s_spec["title"],
                        defaults={
                            "category": cat,
                            "condition": s_spec["condition"],
                            "listing_type": s_spec["listing_type"],
                            "price": s_spec["price"],
                            "description": s_spec["description"],
                            "location": loc,
                            "status": s_spec["status"]
                        }
                    )

                    # Add sample listing event
                    ListingEvent.objects.get_or_create(
                        listing=listing,
                        event_type="viewed",
                        actor=citizen if s_spec["owner"] == farmer else farmer
                    )

                self.stdout.write(self.style.SUCCESS(f"Created/Updated {len(surplus_specs)} Surplus Marketplace Listings."))

                self.stdout.write(self.style.SUCCESS("\nAll demo activity data successfully populated in PostgreSQL/PostGIS!"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error seeding demo activity: {e}"))
            raise e
