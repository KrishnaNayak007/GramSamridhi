from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from io import BytesIO
from PIL import Image

User = get_user_model()

class WasteClassificationTests(APITestCase):

    def setUp(self):
        # Create a test citizen user
        self.citizen_user = User.objects.create_user(
            username="test_citizen",
            password="testpassword123",
            role="citizen"
        )
        self.client.force_authenticate(user=self.citizen_user)

    def test_classify_waste_unauthenticated(self):
        # Force logout
        self.client.force_authenticate(user=None)
        url = reverse('api_v1:waste:classify')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_classify_waste_missing_file(self):
        url = reverse('api_v1:waste:classify')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_classify_waste_success(self):
        url = reverse('api_v1:waste:classify')

        # Create dummy image in memory
        file_io = BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file_io, 'png')
        file_io.seek(0)
        file_io.name = 'test_image.png'

        response = self.client.post(url, {'image': file_io}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn("category", response.data)
        self.assertIn("breakdown", response.data)
        self.assertIn("biotic_percentage", response.data["breakdown"])
        self.assertIn("non_biotic_percentage", response.data["breakdown"])
        self.assertIn("detected_items", response.data)
        self.assertIn("reasoning", response.data)
