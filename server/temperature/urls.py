from django.urls import path
from temperature import views

urlpatterns = [
    path("test/", views.test_endpoint, name="test")
]