# Agriculture Backend Support

Implement backend models, migrations, endpoints, and logic to support agricultural features for farmers: Farm Residue Buy-Back, AI Farming Assistant queries, Government Scheme Portal lists, and Farmer Complaint Box submissions.

## User Review Required

> [!NOTE]
> We will add the `'farmer'` role to the `ROLE_CHOICES` in the Django `User` model. This will allow the separate panels in login/registration flow to verify and authenticating users correctly based on their role.

## Proposed Changes

### Accounts Component

#### [MODIFY] [models.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/accounts/models.py)
- Add `'farmer'` to `ROLE_CHOICES` in the custom `User` model.

### New Agriculture App

We will create a new Django app under `apps/agriculture/` to house the models, serializers, views, and urls.

#### [NEW] [apps.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/agriculture/apps.py)
- Standard Django app config linking `apps.agriculture`.

#### [NEW] [models.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/agriculture/models.py)
Define the following models:
1. **`ResiduePickupRequest`**:
   - `id`: UUID (Primary Key)
   - `farmer`: ForeignKey to `User`
   - `residue_type`: CharField (e.g. `'Paddy Straw'`)
   - `weight_kg`: DecimalField/IntegerField
   - `location_address`: TextField
   - `scheduled_slot`: CharField (e.g. `'Tomorrow, 09:00 - 11:00 AM'`)
   - `status`: CharField (choices: `pending`, `scheduled`, `collected`, `paid`, `cancelled`)
   - `payment_amount`: DecimalField (price paid to farmer, rate per kg base)
   - `payment_status`: CharField (choices: `unpaid`, `processing`, `paid`)
   - `created_at`: DateTimeField
2. **`GovernmentScheme`**:
   - `id`: UUID
   - `name`: CharField
   - `code`: CharField (e.g. `'PKVY'`)
   - `category`: CharField (e.g. `'Organic Farming'`)
   - `description`: TextField
   - `benefits`: TextField
   - `eligibility`: TextField
   - `apply_url`: URLField
   - `is_active`: BooleanField
3. **`FarmerComplaint`**:
   - `id`: UUID
   - `farmer`: ForeignKey to `User`
   - `title`: CharField
   - `category`: CharField (choices: `collection`, `payment`, `schemes`, `other`)
   - `description`: TextField
   - `status`: CharField (choices: `pending`, `reviewing`, `resolved`)
   - `response_resolution`: TextField (response from authority)
   - `created_at`: DateTimeField

#### [NEW] [serializers.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/agriculture/serializers.py)
- DRF Serializers for `ResiduePickupRequest`, `GovernmentScheme`, and `FarmerComplaint`.

#### [NEW] [views.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/agriculture/views.py)
API endpoints:
1. **`ResiduePickupViewSet`**: Create, list, retrieve pickup requests for the authenticated farmer.
2. **`GovernmentSchemeViewSet`**: List active schemes. (We can populate default/mock schemes like PKVY on migration).
3. **`FarmerComplaintViewSet`**: Create and list complaints for the authenticated farmer.
4. **`AIFarmingAssistantView`**: APIView that returns natural farming tips, organic solutions, or answers in regional languages based on a text prompt.

#### [NEW] [urls.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/agriculture/urls.py)
- Route views via DRF routers and custom API paths.

### Project Settings & Main Routing

#### [MODIFY] [settings.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/config/settings.py)
- Register `'apps.agriculture'` in `INSTALLED_APPS`.

#### [MODIFY] [urls.py](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/api/v1/urls.py)
- Include `'apps.agriculture.urls'` under path `agriculture/`.

## Verification Plan

### Automated Tests
- Run Django migrations to verify schema integrity: `python manage.py makemigrations` and `python manage.py migrate`.
- Run Django tests to verify app configuration and views: `python manage.py test apps.agriculture`.

### Manual Verification
- Verify registration works with the `'farmer'` role on endpoint `/api/v1/auth/register/`.
- Call endpoints via postman/curl to verify CRUD operations for:
  - `/api/v1/agriculture/pickups/`
  - `/api/v1/agriculture/schemes/`
  - `/api/v1/agriculture/complaints/`
  - `/api/v1/agriculture/ai-assistant/`
