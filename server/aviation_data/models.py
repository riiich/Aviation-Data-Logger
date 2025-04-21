from django.db import models

'''
    NOTE: 
        - to check previous migrations, go to the migration folder in the current app (can delete previous migrations in the migration folder if needed)
        - when migrating, the database also saves the models that have been migrated in a table called "django_migrations",
            so if there is no important data and desired table can be deleted, first have to remove the row of the django_migration
            so that there aren't any problems between migrating from django to the database
'''

class AviationData(models.Model): 
    acceleration = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    altitude = models.IntegerField(null=True)
    speed = models.DecimalField(max_digits=8, decimal_places=5, null=True)
    latitude = models.DecimalField(max_digits=15, decimal_places=8)
    longitude = models.DecimalField(max_digits=15, decimal_places=8)
    proximity_to_object_in_cm = models.IntegerField(null=True)
    temperature = models.IntegerField(null=True)
    fuel = models.IntegerField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "aviation_data"
        indexes = [
            # created an index for timestamp in the case we want data within some timeframe, which we can retrieve more quickly
            models.Index(fields=["timestamp"]), 
        ]
