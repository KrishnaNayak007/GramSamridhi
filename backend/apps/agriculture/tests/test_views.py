from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from apps.agriculture.models import ResiduePickupRequest, GovernmentScheme, FarmerComplaint

User = get_user_model()

class AgricultureAPITests(APITestCase):

    def setUp(self):
        # Create a test farmer user
        self.farmer_user = User.objects.create_user(
            username="test_farmer",
            password="testpassword123",
            role="farmer"
        )
        # Create a test officer user
        self.officer_user = User.objects.create_user(
            username="test_officer",
            password="testpassword123",
            role="officer"
        )
        
        # Authenticate farmer client by default
        self.client.force_authenticate(user=self.farmer_user)

        # Pre-create a government scheme
        self.scheme = GovernmentScheme.objects.create(
            name="Organic Seed Program",
            code="OSP-TEST",
            category="Seed Support",
            description="Providing high-yielding organic seeds.",
            benefits="Free seeds up to 2 hectares.",
            eligibility="All registered farmers.",
            is_active=True
        )

    def test_create_residue_pickup_request(self):
        url = reverse('api_v1:agriculture:pickup-list')
        data = {
            "residue_type": "Paddy Straw",
            "weight_kg": "100.00",
            "location_address": "Test Farm, Sector 1",
            "scheduled_slot": "Tomorrow, 10 AM"
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ResiduePickupRequest.objects.count(), 1)
        pickup = ResiduePickupRequest.objects.first()
        self.assertEqual(pickup.farmer, self.farmer_user)
        # Check that payment amount was calculated correctly: 100 * 2.15 = 215.00
        self.assertEqual(float(pickup.payment_amount), 215.00)
        self.assertEqual(pickup.status, 'pending')

    def test_list_residue_pickup_requests_farmer_only(self):
        # Create a request for this farmer
        ResiduePickupRequest.objects.create(
            farmer=self.farmer_user,
            residue_type="Paddy Straw",
            weight_kg=50.0,
            location_address="Test Address",
            scheduled_slot="Tomorrow",
            status="pending"
        )
        # Create a request for another farmer
        other_farmer = User.objects.create_user(username="other_farmer", password="pass")
        ResiduePickupRequest.objects.create(
            farmer=other_farmer,
            residue_type="Paddy Straw",
            weight_kg=150.0,
            location_address="Other Address",
            scheduled_slot="Tomorrow",
            status="pending"
        )

        url = reverse('api_v1:agriculture:pickup-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned requests must belong to the farmer_user
        results = response.data.get('results', response.data)
        self.assertTrue(all(p['farmer_username'] == self.farmer_user.username for p in results))

    def test_list_active_schemes(self):
        url = reverse('api_v1:agriculture:scheme-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The test OSP-TEST scheme must be in the list
        results = response.data.get('results', response.data)
        self.assertTrue(any(s['code'] == 'OSP-TEST' for s in results))

    def test_create_complaint(self):
        url = reverse('api_v1:agriculture:complaint-list')
        data = {
            "title": "Delayed Payment Issue",
            "category": "payment",
            "description": "I have not received payment for request."
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FarmerComplaint.objects.count(), 1)
        complaint = FarmerComplaint.objects.first()
        self.assertEqual(complaint.farmer, self.farmer_user)
        self.assertEqual(complaint.status, 'pending')

    def test_ai_farming_assistant_multilingual(self):
        url = reverse('api_v1:agriculture:ai_assistant')
        
        # Test Hindi organic compost query
        data_hi = {"prompt": "गोबर खाद कैसे बनाए?"}
        response_hi = self.client.post(url, data_hi, format='json')
        self.assertEqual(response_hi.status_code, status.HTTP_200_OK)
        self.assertIn("जैविक खाद", response_hi.data['response'])
        self.assertEqual(response_hi.data['language_detected'], 'hi')

        # Test English pest safety query
        data_en = {"prompt": "How to handle insect pest?"}
        response_en = self.client.post(url, data_en, format='json')
        self.assertEqual(response_en.status_code, status.HTTP_200_OK)
        self.assertIn("neem-based solutions", response_en.data['response'])
        self.assertEqual(response_en.data['language_detected'], 'en')
