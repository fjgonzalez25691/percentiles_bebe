from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'babies', views.BabyViewSet, basename='baby')
router.register(r'measurements', views.MeasurementViewSet, basename='measurement')
router.register(r'percentiles', views.PercentileViewSet, basename='percentile')

urlpatterns = [
    path('', include(router.urls)),
    path('fetch-percentiles/', views.fetch_percentiles, name='fetch-percentiles'),
    path('growth-chart/<int:baby_id>/', views.get_growth_chart_data, name='growth-chart'),
    path('users/register/', views.register_user, name='register'),
]