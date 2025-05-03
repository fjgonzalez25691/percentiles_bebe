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
            password=validated_data['password']
        )
        return user  
   
   
class BabySerializer(serializers.ModelSerializer):
    class Meta:
        model = Baby
        fields = '__all__'

class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = '__all__'

class PercentileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Percentile
        fields = '__all__'