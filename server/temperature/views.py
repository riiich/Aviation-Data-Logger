from django.http import JsonResponse
from .models import Temperature
from django.views.decorators.csrf import csrf_exempt
import json

def get_temperature(request):
    return JsonResponse({
        "status": 200,
        "msg": "No temperature for you."
    })

@csrf_exempt
def store_temperatures(request):
    data = json.loads(request.body)
    print(f"fahrenheit: {data["fahrenheit"]}, celsius: {data["celsius"]}")
    fahrenheit = data["fahrenheit"]
    celsius = data["celsius"]

    temperature = Temperature(fahrenheit=fahrenheit, celsius=celsius)
    temperature.save()
    print("Saved data to database!\n")

    return JsonResponse({
        "status": 200,
        "temperature": "POST request info...",
        "dataReceived": data
    })
