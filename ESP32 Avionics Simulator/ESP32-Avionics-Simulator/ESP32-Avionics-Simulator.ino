#include "secrets.h"
#include "DataSimulator.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include <DHT11.h>
#include <ESP32Servo.h>
#include <mbedtls/aes.h>
#include <mbedtls/base64.h>

using namespace websockets;

const int ledPin = 27;
DHT11 dht11(33);  // temperature sensor connected to pin 33

// ultrasonic sensor variables
const int trigPin = 26;
const int echoPin = 14;
long duration;
int distance;  // distance = (speed (speed of sound, which is 340 m/s) * time) / 2   HAVE TO DIVIDE BY 2 TO ACCOUNT FOR THE SOUND WAVE TRAVELING TO THE OBJECT AND BOUNCING BACK

// active buzzer
const int buzzerPin = 32;

int tempToLightLED = 0;

// websocket
WebsocketsClient wsClient;

// JSON variable
String getPayload = "";
String postPayload = "";

// data simulator
DataSimulator simulateAviationData(millis());
float acceleration = 0.0;
int altitude = 0.0;
float speed = 0.0;
int distanceBetweenObjectInCm = 0;
int temperature = 0;
int nauticalMiles = 420;

void setup() {
    Serial.begin(115200);
    pinMode(ledPin, OUTPUT);

    // ultrasonic sensor setup
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);

    // active buzzer
    pinMode(buzzerPin, OUTPUT);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to ");
    Serial.print(String(WIFI_SSID));
    Serial.println("...");

    // waiting for wifi connection
    while (WiFi.status() != WL_CONNECTED) {
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

    if (wsConnectionStatus) {
        Serial.println("Websocket connection established!");
        // wsClient.send(postData);
        wsClient.ping();
    } else {
        Serial.println("Error establishing a websocket connection...");
    }
}

void loop() {
    unsigned long currentMillisServo = millis();

    // ultrasonic sensor logic
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);

    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // return sound wave travel time
    duration = pulseIn(echoPin, HIGH);
    distance = duration * 0.034 / 2;  //

    Serial.print("Distance: ");
    Serial.println(distance);
    distanceBetweenObjectInCm = distance;

    if (distance <= 10) {
        digitalWrite(buzzerPin, HIGH);
        digitalWrite(ledPin, HIGH);
        Serial.println("DANGER!");
    } 
    else {
        digitalWrite(buzzerPin, LOW);
        digitalWrite(ledPin, LOW);
    }

    acceleration = simulateAviationData.simulateAcceleration(millis());
    altitude = simulateAviationData.simulateAltitude(millis());
    speed = simulateAviationData.simulateSpeed(millis());

    nauticalMiles -= 1;

    if (nauticalMiles < 1) 
        nauticalMiles = 0;

    temperature = dht11.readTemperature();

    if(temperature == DHT11::ERROR_CHECKSUM && temperature == DHT11::ERROR_TIMEOUT) {
		Serial.print("Error: ");
		Serial.println(DHT11::getErrorString(temperature));
		return;
	}

    Serial.print("Temperature: ");
    Serial.println(temperature);

    // send sensor data to server
    if (wsClient.available())
        sendSensorData(wsClient, acceleration, altitude, speed, distanceBetweenObjectInCm, temperature, nauticalMiles);

    wsClient.poll();

    delay(500);
}

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Response from server: ");
    Serial.println(message.data());
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if (event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");

        // sendSensorData();

        Serial.print("Sent: ");
    } else if (event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
    } else if (event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if (event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}

// sending the sensor data to server
void sendSensorData(WebsocketsClient& wsClient, float& acceleration, int& altitude, 
                    float& speed, int& distanceBetweenObjectInCm, int& temperature, 
                    int& nauticalMiles) {
    DynamicJsonDocument doc(60);
    doc["acceleration"] = acceleration;
    doc["altitude"] = altitude;
    doc["speed"] = speed;
    doc["distance_between_object_in_cm"] = distanceBetweenObjectInCm;
    doc["temperature"] = temperature;
    doc["nautical_miles"] = nauticalMiles;
    doc["type"] = "sensor_data";
    doc["source"] = "esp32";
    doc["message"] = "From ESP32!";

    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);
    wsClient.send(jsonBuffer);
}

String encryptData(String plainText) {
    // temporary buffer for plaintext with padding
    int plainTextLength = plainText.length();
    int paddingSize = 16 - (plainTextLength % 16);
    int totalLength = plainTextLength + paddingSize;

    // input buffer and apply PKCS#7 padding
    unsigned char* input = new unsigned char[totalLength];
    memcpy(input, plainText.c_str(), plainTextLength);

    // add padding bytes
    for(int i = 0; i < paddingSize; i++) { 
        input[plainTextLength + i] = paddingSize;
    }

    // create output buffer for encrypted data
    unsigned char* output = new unsigned char[totalLength]; 

    // create a copy of IV (because it will get modified during encryption)
    unsigned char copyIV[16];
    memcpy(copyIV, ENCRYPTION_IV, 16);

    // set up AES context
    mbedtls_aes_context aesContext;
    mbedtls_aes_init(&aesContext);
    mbedtls_aes_setkey_enc(&aesContext, ENCRYPTION_KEY, 128);

    // encrypt data in cbc mode (cipher block chaining) 
    for(int i = 0; i < totalLength; i += 16) {
        // encrypt the current block
        mbedtls_aes_crypt_cbc(&aesContext, MBEDTLS_AES_ENCRYPT, 16, copyIV, input + i, output + i);
    }

    // base64 encode the encrypted data for transmission
    size_t base64Length;
    unsigned char* base64Buffer = new unsigned char[totalLength * 2];   // extra space for base64

    mbedtls_base64_encode(base64Buffer, totalLength * 2, &base64Length, output, totalLength);

    // convert to string
    String encryptedResult = String((char*)base64Buffer);

    // clean up
    delete[] input;
    delete[] output;
    delete[] base64Buffer;

    return encryptedResult;
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