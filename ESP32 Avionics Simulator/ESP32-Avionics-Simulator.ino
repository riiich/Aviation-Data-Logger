#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT11.h>
#include "secrets.h"
#include "DataSimulator.h"

// hardware variables
const int ledPin = 27;
DHT11 dht11(33);  // dht11 sensor connected to GIO25

int temperatureCelsius = 0;
int temperatureFahrenheight = 0;
int humidityLevel = 0;

int tempToLightLED = 0;

// JSON variable
String getPayload = "";
String postPayload = "";

// String serverURL = SERVER_URL;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT); 
  // pinMode(buttonPin, INPUT_PULLUP);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to ");
  Serial.print(String(WIFI_SSID));
  Serial.println("...");

  // waiting for wifi connection
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Attempting to connect to wifi...");
  }

  // wifi connected
  Serial.println("Connected to wifi! =)");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  getTemperature();

  makePOSTRequest();

  delay(2000);
}

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
