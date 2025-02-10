from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def get_aviation_data(request):
    return JsonResponse({
        "status": 200,
        "msg": "No aviation data for you."
    })

@csrf_exempt
def store_temperatures(request):
    data = json.loads(request.body)

    return JsonResponse({
        "status": 200,
        "dataReceived": data
    })
