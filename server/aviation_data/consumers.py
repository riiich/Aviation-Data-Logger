from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
import json
import asyncio
import random
from utils.decrypt import decrypt_data
from aviation_data.models import AviationData

DANGER_DISTANCE = 10

class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("sensor_data", self.channel_name)    # add client to a group (sensor_data) so data can be sent to all clients in this group

        print(f"Channel name: {self.channel_name}")
        print("Websocket connected and added to 'sensor_data' group...")

        asyncio.create_task(self.welcome_msg())

    async def welcome_msg(self):
        await asyncio.sleep(0.2)
        await self.send(text_data=json.dumps({ "msg": "Websocket connected to server! =)" }))

    async def disconnect(self, close):
        print("Websocket disconnected...", close)

    async def receive(self, text_data):
        try:
            json_data = json.loads(text_data)
            distance_from_object_from_cm_to_ft = 0.0
            objectWithinDistance = False

            acceleration = json_data.get("acceleration")
            altitude = json_data.get("altitude")
            speed = json_data.get("speed")
            latitude = getRandomLat(34.15, 0.0001)
            longitude = getRandomLng(-118.217839, 0.0001)
            temperature = json_data.get("temperature")
            fuel = json_data.get("fuel")
            distance_between_object_in_cm = json_data.get("distance_between_object_in_cm")

            if distance_between_object_in_cm:
                distance_from_object_from_cm_to_ft = float(distance_between_object_in_cm * 0.0328)

                if distance_between_object_in_cm <= DANGER_DISTANCE:
                    objectWithinDistance = True
            else:
                distance_from_object_from_cm_to_ft = None
                objectWithinDistance = False

            # data sent to client
            sensor_data = {
                "acceleration": acceleration,
                "altitude": altitude,
                "speed": speed,
                "distanceFromObjectInFt": distance_from_object_from_cm_to_ft,
                "objectWithinDistance": objectWithinDistance,
                "fuel": fuel,
                "temperature_in_celsius": temperature,
                "latitude": latitude,
                "longitude": longitude,
                "source": "server",
                "message": "From server!",
            }

            if acceleration and altitude and speed and latitude and longitude:
                await save_aviation_data(acceleration, altitude, speed, latitude, longitude, temperature, fuel, distance_between_object_in_cm)
            else:
                print("not saved...")

            print("sensor data: ", text_data)

            if json_data["source"] == "esp32":
                print(f"Data from ESP32: {json_data["message"]}")
                await self.channel_layer.group_send("sensor_data", { "type": "sensor_update" , "message": json.dumps(sensor_data) })

        except json.JSONDecodeError:
            print("Invalid JSON")

    async def sensor_update(self, event):
        message = event["message"]
        
        await self.send(text_data=message)

@sync_to_async
def save_aviation_data(acceleration, altitude, speed, latitude, longitude, temperature, fuel, distance_between_object_in_cm):
    aviation_data = AviationData(acceleration=acceleration, 
                                altitude=altitude, 
                                speed=speed, 
                                latitude=latitude, 
                                longitude=longitude,
                                temperature=temperature, 
                                fuel=fuel,
                                proximity_to_object_in_cm=distance_between_object_in_cm
                                )

    aviation_data.save()
    print("Data saved to database!")


# simulating random coordinates to be shown in google maps
def getRandomLat(centerLat, latRange):
    return centerLat + (random.random() * 2 - 1) * latRange

def getRandomLng(centerLng, lngRange):
    return centerLng + (random.random() * 2 - 1) * lngRange
