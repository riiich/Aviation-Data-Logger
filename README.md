
https://github.com/user-attachments/assets/6f367220-8d42-4fdb-ad33-a1c412910179

https://github.com/user-attachments/assets/31d7086a-8129-46b1-a042-d0d5f7320910

<img width="3024" height="4032" alt="materials used" src="https://github.com/user-attachments/assets/7468d4d0-0a9c-4a43-8455-7f489f3b2b5f" />


<img width="2048" height="1536" alt="1ab83509-8d13-4cf1-b5c0-f430d430748f" src="https://github.com/user-attachments/assets/027742b6-90c2-4c69-9874-f76dad3a1459" />



# Aviation-Data-Logger

Flight simulator using a makeshift "plane". Utilized ESP32 for wifi capability to send data from sensors to backend to be stored in database via web sockets.

ESP32 was used as a client to take in data from sensors such as ultrasonic sensor, DHT11 sensor (temperature). It configured with C++ code.
Dashboard was built using React (TypeScript) to display sensor data to simulate a cockpit dashboard.
Server was built in Django to handle  data flow with websockets (django channels) and data storage. I really only used Django because I was interested in using a Python framework for the backend and learning more about it.

Created mock data for coordinates to simulate the "plane" flying around, which was used with Google Maps API to display the maps moving in real-time.
Since I didn't have certain sensors to detect altitude and speed, I also created a class that gave me a range of random values which I also based in real data with real planes (average altitude & speed while in air). 


Demo: Uploading ef77e355-5ea7-4125-9c3f-95f7187930d6.mp4…

