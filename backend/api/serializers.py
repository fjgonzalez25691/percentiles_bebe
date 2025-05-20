# Importar los serializers de Django REST Framework
from rest_framework import serializers
from .models import Baby, Measurement, Percentile
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user  
   
   
class BabySerializer(serializers.ModelSerializer):
    class Meta:
        model = Baby
        fields = ['id', 'name', 'birth_date', 'gender', 'user']  # Incluye 'user' explícitamente
        read_only_fields = ['user']  # Marca 'user' como de solo lectura

class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = '__all__'

class PercentileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Percentile
        fields = '__all__'