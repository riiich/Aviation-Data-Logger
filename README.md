# Aviation-Data-Logger

Flight simulator using a makeshift "plane". Utilized ESP32 for wifi capability to send data from sensors to backend to be stored in database via web sockets.

ESP32 was used as a client to take in data from sensors such as ultrasonic sensor, DHT11 sensor (temperature). It configured with C++ code.
Dashboard was built using React (TypeScript) to display sensor data to simulate a cockpit dashboard.
Server was built in Django to handle  data flow with websockets (django channels) and data storage. I really only used Django because I was interested in using a Python framework for the backend and learning more about it.

Created mock data for coordinates to simulate the "plane" flying around, which was used with Google Maps API to display the maps moving in real-time.
Since I didn't have certain sensors to detect altitude and speed, I also created a class that gave me a range of random values which I also based in real data with real planes (average altitude & speed while in air). 
