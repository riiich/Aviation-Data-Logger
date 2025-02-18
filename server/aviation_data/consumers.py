from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
import asyncio

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
            message = json_data.get("message")

            sensor_data = {
                "acceleration": json_data.get("acceleration"),
                "altitude": json_data.get("altitude"),
                "speed": json_data.get("speed"),
                "source": json_data.get("source"),
            }

            print("json data: ", text_data)
            print(f"message: {message}")
            # print(f"acceleration: {json_data["acceleration"]}")
            # print(f"altitude: {json_data["altitude"]}")
            # print(f"speed: {json_data["speed"]}")

            if json_data["source"] == "esp32":
                print(f"Data from ESP32: {json_data["message"]}")
                await self.channel_layer.group_send("sensor_data", { "type": "sensor_update" , "message": json.dumps(sensor_data) })

        except json.JSONDecodeError:
            print("Invalid JSON")

    async def sensor_update(self, event):
        message = event["message"]
        
        await self.send(text_data=message)