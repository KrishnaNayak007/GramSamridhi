import pytest
from django.urls import reverse
from rest_framework import status
from apps.accounts.models import User, UserPreferences, UserSession
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

@pytest.mark.django_db
def test_user_registration(client):
    url = reverse('api_v1:auth:register')
    payload = {
        "email": "test@swachsahyog.in",
        "phone": "+919999999999",
        "password": "strongpassword123",
        "role": "citizen"
    }
    response = client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert 'access' in response.data
    assert 'refresh' in response.data

    # Verify user preferences were created in the same transaction
    user = User.objects.get(email="test@swachsahyog.in")
    assert UserPreferences.objects.filter(user=user).exists()

    # Verify session was logged
    assert UserSession.objects.filter(user=user).exists()

@pytest.mark.django_db
def test_user_logout(client):
    # 1. Register first
    url_reg = reverse('api_v1:auth:register')
    payload_reg = {
        "email": "logout@swachsahyog.in",
        "password": "strongpassword123",
        "role": "citizen"
    }
    res_reg = client.post(url_reg, payload_reg, format='json')
    refresh_token = res_reg.data['refresh']
    access_token = res_reg.data['access']

    # 2. Call logout
    url_logout = reverse('api_v1:auth:logout')
    client.defaults['HTTP_AUTHORIZATION'] = f"Bearer {access_token}"
    response = client.post(url_logout, {"refresh": refresh_token}, format='json')
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # 3. Check JTI is blacklisted
    assert BlacklistedToken.objects.exists()

@pytest.mark.django_db
def test_session_revocation_blacklists_token(client):
    # 1. Register and retrieve session
    url_reg = reverse('api_v1:auth:register')
    payload_reg = {
        "email": "session@swachsahyog.in",
        "password": "strongpassword123",
        "role": "citizen"
    }
    res_reg = client.post(url_reg, payload_reg, format='json')
    access_token = res_reg.data['access']

    user = User.objects.get(email="session@swachsahyog.in")
    session = UserSession.objects.get(user=user)

    # 2. Call DELETE /sessions/{id}/ (mapped in accounts views)
    url_delete = reverse('api_v1:accounts:session_revoke', kwargs={"pk": session.id})
    client.defaults['HTTP_AUTHORIZATION'] = f"Bearer {access_token}"
    response = client.delete(url_delete)
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # 3. Verify session was soft-deleted and token JTI is blacklisted
    assert UserSession.objects.filter(user=user).count() == 0
    assert BlacklistedToken.objects.exists()
