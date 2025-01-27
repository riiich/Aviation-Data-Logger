from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def test_endpoint(request):
    return JsonResponse({ 
        "status": 200, 
        "msg": "Endpoint hit. Now go work on the temperature!"
    })

def receive_temperature(request):
    pass