from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Seeds local administrative boundaries, municipal departments, surplus categories, and test user credentials (delegates to seed_Bhubaneswar_data)."

    def handle(self, *args, **options):
        self.stdout.write("Delegating to seed_Bhubaneswar_data...")
        call_command('seed_Bhubaneswar_data')
