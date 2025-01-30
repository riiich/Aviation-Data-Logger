from django.db import models
from django.utils import timezone

# Create your models here.
class Temperature(models.Model):
    fahrenheit = models.IntegerField()
    celsius = models.IntegerField()
    time = models.TimeField(default=timezone.now)
    date = models.DateField(default=timezone.now)
    
    class Meta:
        db_table = "temperature"