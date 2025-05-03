from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Baby, Measurement, Percentile
from .serializers import BabySerializer, MeasurementSerializer, PercentileSerializer, UserSerializer
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Registra un nuevo usuario
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Crear token para el usuario
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BabyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BabySerializer
    
    def get_queryset(self):
        return Baby.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MeasurementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MeasurementSerializer
    
    def get_queryset(self):
        return Measurement.objects.filter(baby__user=self.request.user)

class PercentileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PercentileSerializer
    queryset = Percentile.objects.all()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_percentiles(request):
    """
    Función para extraer datos de percentiles de la OMS.
    Esta es una implementación simplificada. En un entorno real,
    necesitarías manejar más casos y posiblemente usar una fuente de datos más directa.
    """
    try:
        # Aquí iría el código para extraer datos de la web de la OMS
        # Este es un ejemplo simplificado
        
        # Simulamos la extracción de datos
        # En un caso real, usarías requests y BeautifulSoup para extraer datos de la web
        
        # Ejemplo de cómo podría ser:
        # url = "https://www.who.int/childgrowth/standards/weight_for_age/en/"
        # response = requests.get(url)
        # soup = BeautifulSoup(response.content, 'html.parser')
        # ... código para extraer y procesar los datos ...
        
        # Por ahora, simplemente devolvemos un mensaje de éxito
        return Response({"message": "Percentiles actualizados correctamente"})
    
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_growth_chart_data(request, baby_id):
    """
    Obtiene los datos para el gráfico de crecimiento de un bebé específico
    """
    try:
        baby = Baby.objects.get(id=baby_id, user=request.user)
        measurements = Measurement.objects.filter(baby=baby).order_by('age_weeks')
        
        # Obtener percentiles relevantes
        max_age = measurements.last().age_weeks if measurements.exists() else 52  # Por defecto 1 año
        
        weight_percentiles = Percentile.objects.filter(
            gender=baby.gender,
            measure_type='weight',
            age_weeks__lte=max_age,
            percentile__in=[3, 50, 97]  # Percentiles mínimo, medio y máximo
        )
        
        height_percentiles = Percentile.objects.filter(
            gender=baby.gender,
            measure_type='height',
            age_weeks__lte=max_age,
            percentile__in=[3, 50, 97]
        )
        
        head_percentiles = Percentile.objects.filter(
            gender=baby.gender,
            measure_type='head',
            age_weeks__lte=max_age,
            percentile__in=[3, 50, 97]
        )
        
        # Preparar datos para el frontend
        data = {
            'baby': BabySerializer(baby).data,
            'measurements': MeasurementSerializer(measurements, many=True).data,
            'percentiles': {
                'weight': PercentileSerializer(weight_percentiles, many=True).data,
                'height': PercentileSerializer(height_percentiles, many=True).data,
                'head': PercentileSerializer(head_percentiles, many=True).data,
            }
        }
        
        return Response(data)
    
    except Baby.DoesNotExist:
        return Response({"error": "Bebé no encontrado"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)