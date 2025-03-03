from django.db import models

class AviationData(models.Model): 
    acceleration = models.DecimalField(max_digits=2, decimal_places=2)
    altitude = models.IntegerField()
    speed = models.DecimalField(max_digits=2, decimal_places=2)
    latitude = models.DecimalField(max_digits=6, decimal_places=2)
    longitude = models.DecimalField(max_digits=6, decimal_places=2)
    temperature = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            # created an index for timestamp in the case we want data within some timeframe, which we can retrieve more quickly
            models.Index(fields=["timestamp"]), 
        ]
