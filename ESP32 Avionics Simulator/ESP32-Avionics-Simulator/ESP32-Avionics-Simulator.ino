#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include <DHT11.h>
#include "secrets.h"
#include "DataSimulator.h"

using namespace websockets;

// hardware variables
const int ledPin = 27;
DHT11 dht11(33);  // dht11 sensor connected to GIO25

int tempToLightLED = 0;

// websocket
WebsocketsClient wsClient;

// JSON variable
String getPayload = "";
String postPayload = "";

// data simulator
DataSimulator simulateAviationData(millis());
float acceleration = 0.0;
float altitude = 0.0;
float speed = 0.0;
int temperature = 0;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT); 
  // pinMode(buttonPin, INPUT_PULLUP);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to ");
  Serial.print(String(WIFI_SSID));
  Serial.println("...");

  // waiting for wifi connection
  while(WiFi.status() != WL_CONNECTED) {
    delay(1500);
    Serial.println("Attempting to connect to wifi...");
  } 

  // wifi connected
  Serial.println("Connected to wifi! =)");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // websocket callbacks
  wsClient.onMessage(onMessageCallback);
  wsClient.onEvent(onEventsCallback);
  
  bool wsConnectionStatus = wsClient.connect(WEBSOCKET_URL);

  if(wsConnectionStatus) {
    Serial.println("Websocket connection established!");
    // wsClient.send(postData);
    wsClient.ping();
  }
  else {
    Serial.println("Error establishing a websocket connection...");
  }

  Serial.setDebugOutput(true);

}

void loop() {
  acceleration = simulateAviationData.simulateAcceleration(millis());
  altitude = simulateAviationData.simulateAltitude(millis());
  speed = simulateAviationData.simulateSpeed(millis());

  Serial.print("Acceleration: ");
  Serial.print(acceleration);
  Serial.println(" km/h/s");

  Serial.print("Altitude: ");
  Serial.print(altitude);
  Serial.println(" ft");

  Serial.print("Speed: ");
  Serial.print(speed);
  Serial.println(" km/hr");
  Serial.println();

  // send sensor data to server
  if (wsClient.available()) {
        DynamicJsonDocument doc(100); 

        doc["acceleration"] = acceleration;
        doc["altitude"] = altitude;
        doc["speed"] = speed;
        doc["type"] = "sensor_data";
        doc["source"] = "esp32";
        doc["message"] = "From ESP32!";
        
        char jsonBuffer[256];
        serializeJson(doc, jsonBuffer);

        wsClient.send(jsonBuffer);
    }

  wsClient.poll();

  delay(1000);
}

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Response from server: ");
    Serial.println(message.data());
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");

        // sendSensorData();

        Serial.print("Sent: ");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
    } else if(event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if(event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}


void sendSensorData() {
    DynamicJsonDocument doc(60); // Adjust size as needed

    doc["acceleration"] = acceleration;
    doc["altitude"] = altitude;
    doc["speed"] = speed;
    doc["temperature"] = temperature;
    doc["message"] = "From ESP32!";

    String jsonString;
    // serializeJson(doc, jsonString);

    Serial.println(jsonString);
}

/*
void getTemperature() {
  temperatureCelsius = dht11.readTemperature();
  humidityLevel = dht11.readHumidity();

  if(temperatureCelsius == DHT11::ERROR_CHECKSUM && temperatureCelsius == DHT11::ERROR_TIMEOUT) {
    Serial.print("Error: ");
    Serial.println(DHT11::getErrorString(temperatureCelsius));
    return;
  }
  if(humidityLevel == DHT11::ERROR_CHECKSUM && humidityLevel == DHT11::ERROR_TIMEOUT) {
    Serial.print("Error: ");
    Serial.println(DHT11::getErrorString(humidityLevel));
    return;
  }

  temperatureFahrenheight = tempToLightLED = celsiusToFahrenheit(temperatureCelsius);

  if(tempToLightLED > 55) digitalWrite(ledPin, HIGH);
  else digitalWrite(ledPin, LOW);


  Serial.print("Current temperature (in °C): ");
  Serial.print(temperatureCelsius);
  Serial.println(" °C");
  Serial.print("Current temperature (in °F: ");
  Serial.print(temperatureFahrenheight);
  Serial.println(" °F");
  Serial.print("Current humidity level: ");
  Serial.print(humidityLevel);
  Serial.println("%");
  Serial.println();
}

// GET request to test retrieving data from server
void makeGETRequest() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient httpClient;

    if(httpClient.begin(GET_TEMPERATURE_SERVER_ENDPOINT)) {
      httpClient.addHeader("User-Agent", "ESP32");
      int httpCode = httpClient.GET();

      if(httpCode > 0) {
        Serial.println("HTTP Code: " + String(httpCode));

        getPayload = httpClient.getString();
        Serial.println("Response: " + getPayload);

        // deserialize the json data received from server
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, getPayload);

        if(error) {
          Serial.println("Deserialization failed...");
          Serial.println(error.c_str());
          
          return;
        }

        // extract data from json
        String msg = doc["msg"];
        Serial.println("msg: " + msg);
      }
      else {
        Serial.println("Error trying to reach the server...");
        Serial.println(GET_TEMPERATURE_SERVER_ENDPOINT);
        Serial.println("HTTP code: " + String(httpCode));
        Serial.println("Error description: " + httpClient.errorToString(httpCode));
      }

      httpClient.end();
    }
    else {
      Serial.println("Failed to connect to the server...");
    }
  } 
  else {
    Serial.println("WiFi disconnected...");
  }
}

// POST request to store temperature in server 
void makePOSTRequest() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient httpClient;

    if(httpClient.begin(POST_TEMPERATURE_SERVER_ENDPOINT)) {
      httpClient.addHeader("Content-Type", "application/json");
      httpClient.addHeader("User-Agent", "ESP32");

      // serialized json data to send to server
      String postData = "{\"fahrenheit\":" + String(temperatureFahrenheight) + ", \"celsius\":" + String(temperatureCelsius) + "}";

      int httpCode = httpClient.POST(postData);

      if (httpCode > 0) {
        postPayload = httpClient.getString();
        Serial.print("Status Code: ");
        Serial.println(httpCode);
        Serial.print("Response: ");
        Serial.println(postPayload);
      }
      else {
        Serial.println("There was an error sending a POST request...");
      }

      httpClient.end();
    }
  }
  else {
    Serial.println("WiFi disconnected...");
  }

  delay(5000);
}

int celsiusToFahrenheit(int celsius) {
  return (celsius * (9/5)) + 32;
}
*/