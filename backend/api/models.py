from django.db import models
from django.contrib.auth.models import User




class Baby(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='babies')
    name = models.CharField(max_length=100)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    is_premature = models.BooleanField(default=False)
    gestation_weeks = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.name

class Measurement(models.Model):
    baby = models.ForeignKey(Baby, on_delete=models.CASCADE, related_name='measurements')
    date = models.DateField()
    age_weeks = models.IntegerField()
    weight = models.FloatField(help_text="Peso en gramos")
    height = models.FloatField(help_text="Altura en centímetros")
    head_circumference = models.FloatField(help_text="Perímetro craneal en centímetros")
    
    class Meta:
        ordering = ['date']
    
    def __str__(self):
        return f"{self.baby.name} - {self.date}"

class Percentile(models.Model):
    MEASURE_TYPES = [
        ('weight', 'Peso'),
        ('height', 'Altura'),
        ('head', 'Perímetro Craneal'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    ]
    
    age_weeks = models.IntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    measure_type = models.CharField(max_length=10, choices=MEASURE_TYPES)
    percentile = models.IntegerField()  # 3, 10, 25, 50, 75, 90, 97
    value = models.FloatField()
    
    class Meta:
        unique_together = ['age_weeks', 'gender', 'measure_type', 'percentile']
    
    def __str__(self):
        return f"{self.get_measure_type_display()} - {self.get_gender_display()} - {self.age_weeks} semanas - P{self.percentile}"