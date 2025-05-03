from django.contrib import admin

from .models import Baby, Measurement, Percentile

@admin.register(Baby)
class BabyAdmin(admin.ModelAdmin):
    # Listar todo los campos del modelo Baby en el panel de administración
    list_display = [field.name for field in Baby._meta.fields]
    
@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    # Listar todo los campos del modelo Measurement en el panel de administración
    list_display = [field.name for field in Measurement._meta.fields]
    
@admin.register(Percentile)
class PercentileAdmin(admin.ModelAdmin):
    # Listar todo los campos del modelo Percentile en el panel de administración
    list_display = [field.name for field in Percentile._meta.fields]
      
    