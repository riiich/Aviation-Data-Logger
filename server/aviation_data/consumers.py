from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio

class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("Websocket connected...")

        asyncio.create_task(self.welcome_msg())

        # time.sleep(2)

        # self.send(text_data=json.dumps({
        #     "msg": "Websocket connected! =)"
        # }))

    async def welcome_msg(self):
        await asyncio.sleep(0.2)
        await self.send(text_data=json.dumps({ "msg": "Websocket connected! =)" }))

    async def disconnect(self, close):
        print("Websocket disconnected...", close)

    async def receive(self, text_data):
        try:
            json_data = json.loads(text_data)
            message = json_data["msg"]

            print("json data: ", text_data)

            print(f"message: {message}")

            await self.send(text_data=json.dumps({
                "msg": message
            }))
        except json.JSONDecodeError:
            print("Invalid JSON")
