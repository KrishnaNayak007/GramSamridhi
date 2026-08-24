from django.core.management.base import BaseCommand
from apps.agriculture.models import GovernmentScheme

class Command(BaseCommand):
    help = 'Populates the database with default agricultural government schemes.'

    def handle(self, *args, **options):
        schemes = [
            {
                "name": "Paramparagat Krishi Vikas Yojana",
                "code": "PKVY",
                "category": "Organic Farming",
                "description": "Support for cluster-based organic farming, certifications, and farmer capacity building.",
                "benefits": "Financial assistance of ₹50,000 per hectare for 3 years, cluster incentives, organic manure, and seed supply.",
                "eligibility": "All Indian farmers practicing or willing to convert to cluster-based organic farming (minimum cluster size of 20 hectares).",
                "apply_url": "https://pgsindia-ncof.dac.net.in/pkvy/pkvy.aspx",
                "is_active": True
            },
            {
                "name": "Sub-Mission on Agricultural Mechanization",
                "code": "SMAM",
                "category": "Residue Management & Machinery",
                "description": "Subsidy support for purchasing agricultural residue management machines like Super Straw Management System (Super SMS), Happy Seeder, Mulcher, and Paddy Straw Chopper.",
                "benefits": "50% subsidy to individual farmers and 80% subsidy to Custom Hiring Centers (CHCs) for crop residue management machinery.",
                "eligibility": "Farmers practicing agriculture residing in residue-burning states (e.g. Punjab, Haryana, Uttar Pradesh, NCT of Delhi).",
                "apply_url": "https://agrimachinery.nic.in/",
                "is_active": True
            },
            {
                "name": "National Mission for Sustainable Agriculture",
                "code": "NMSA",
                "category": "Sustainable Agriculture",
                "description": "Promoting rainfed agriculture, soil health management, and climate-resilient farming techniques.",
                "benefits": "Financial aid for micro-irrigation systems, farm ponds, soil health cards, and green manure production.",
                "eligibility": "Small and marginal farmers across all Indian states and Union Territories.",
                "apply_url": "https://nmsa.dac.gov.in/",
                "is_active": True
            }
        ]

        for s_data in schemes:
            obj, created = GovernmentScheme.objects.update_or_create(
                code=s_data["code"],
                defaults=s_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created scheme: {obj.name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Updated scheme: {obj.name}"))
