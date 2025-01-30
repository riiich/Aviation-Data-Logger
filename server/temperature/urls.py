from django.urls import path
from temperature import views

urlpatterns = [
    path("temperature/", views.get_temperature, name="temperature"),
    path("store-temperature/", views.store_temperatures, name="store-temperature")
]
