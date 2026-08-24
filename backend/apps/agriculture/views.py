from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from .models import ResiduePickupRequest, GovernmentScheme, FarmerComplaint
from .serializers import (
    ResiduePickupRequestSerializer,
    GovernmentSchemeSerializer,
    FarmerComplaintSerializer
)

class ResiduePickupViewSet(viewsets.ModelViewSet):
    serializer_class = ResiduePickupRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Farmers only see their own requests; authority officers can see all
        if self.request.user.role == 'officer':
            return ResiduePickupRequest.objects.all()
        return ResiduePickupRequest.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        # Calculate a payment amount dynamically (e.g. ₹2.15 per kg rate)
        weight = Decimal(serializer.validated_data.get('weight_kg', 0))
        rate_per_kg = Decimal('2.15')
        amount = weight * rate_per_kg
        
        serializer.save(
            farmer=self.request.user,
            payment_amount=amount,
            status='pending',
            payment_status='unpaid'
        )


class GovernmentSchemeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GovernmentScheme.objects.filter(is_active=True)
    serializer_class = GovernmentSchemeSerializer
    permission_classes = [permissions.IsAuthenticated]


class FarmerComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'officer':
            return FarmerComplaint.objects.all()
        return FarmerComplaint.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            farmer=self.request.user,
            status='pending'
        )


class AIFarmingAssistantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response(
                {"error": "Prompt field is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Basic multilingual heuristic replies
        prompt_lower = prompt.lower()
        response_text = ""

        if any(keyword in prompt_lower for keyword in ["खाद", "कम्पोस्ट", "गोबर", "जैविक"]):
            response_text = (
                "नमस्ते! जैविक खाद (Organic Compost) बनाने के लिए धान के अवशेष (पॉली/पुआल) को "
                "छोटे टुकड़ों में काट लें। इसे गोबर, मिट्टी और हरी पत्तियों के साथ मिलकर 60-90 दिनों तक "
                "नमी में रखें। इससे उत्तम गुणवत्ता वाली खाद तैयार होगी जो मिट्टी की उत्पादकता बढ़ाएगी।"
            )
        elif any(keyword in prompt_lower for keyword in ["कीड़ा", "बीमारी", "पेस्ट", "सुरक्षा"]):
            response_text = (
                "कीटनाशक सुरक्षा के लिए आप नीम के काढ़े (Neem oil spray) का उपयोग कर सकते हैं। "
                "10 लीटर पानी में 50 मिलीलीटर नीम का तेल और थोड़ा सा साबुन का घोल मिलाकर "
                "फसलों पर छिड़काव करें। यह एक सुरक्षित और प्राकृतिक उपाय है।"
            )
        elif any(keyword in prompt_lower for keyword in ["compost", "residue", "manure", "organic"]):
            response_text = (
                "Hello! To prepare high-quality organic compost, mix crop residue with green leaves "
                "and manure (1:3 ratio), keep it moist, and turn it every 15 days. Within 8-10 weeks, "
                "you will have nutrient-rich compost ready for your fields, helping you avoid residue burning."
            )
        elif any(keyword in prompt_lower for keyword in ["pest", "disease", "insect"]):
            response_text = (
                "For natural pest management, we recommend neem-based solutions. Spraying a mixture of "
                "neem oil (5ml/L of water) with a few drops of liquid soap helps control aphids, whiteflies, "
                "and caterpillars without chemical side effects."
            )
        else:
            # Fallback general query assistant response
            response_text = (
                "Hello! I am your KrishiSahyog assistant. You can ask me any questions about organic farming, "
                "crop residue recycling, composting methods, or pest control in English, Hindi, or Odia. "
                "For example: 'How do I make organic compost?' or 'जैविक खेती क्या है?'"
            )

        return Response({
            "prompt": prompt,
            "response": response_text,
            "language_detected": "hi" if any(ord(c) > 127 for c in prompt) else "en"
        }, status=status.HTTP_200_OK)
