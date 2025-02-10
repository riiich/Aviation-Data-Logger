from django.urls import path
from aviation_data import views

urlpatterns = [
    path("aviation-data/", views.get_aviation_data, name="aviation-data"),
]