from os import name
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Baby, Measurement, Percentile
from rest_framework.authtoken.models import Token

# Create your tests here.

class BabyCreationTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        
        # Generar un token para el usuario
        self.token = Token.objects.create(user=self.user)
        
        # Autenticación del cliente
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        

    def test_create_baby(self):
        url = '/api/babies/'
        data = {
            'name': 'Test Baby',
            'birth_date': '2023-01-01',
            'gender': 'M'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Baby.objects.count(), 1)
        baby = Baby.objects.get(name='Test Baby')
        self.assertEqual(baby.user, self.user)