from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Seeds administrative hierarchy, schemes, test users, and realistic demo activity (incidents, residue pickups, complaints, and surplus listings)."

    def handle(self, *args, **options):
        self.stdout.write("1. Delegating to seed_odisha_data...")
        call_command('seed_odisha_data')

        self.stdout.write("\n2. Delegating to populate_schemes...")
        call_command('populate_schemes')

        self.stdout.write("\n3. Delegating to seed_demo_activity...")
        call_command('seed_demo_activity')

        self.stdout.write(self.style.SUCCESS("\nAll demo data seeded successfully!"))
