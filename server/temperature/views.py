from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def get_temperature(request):
    return JsonResponse({
        "status": 200,
        "msg": "No temperature for you."
    })

def store_temperatures(request):
    print(request.body)

    return JsonResponse({
        "status": 200,
        "temperature": "no info"
    })