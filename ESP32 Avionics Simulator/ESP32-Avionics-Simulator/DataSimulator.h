#ifndef DataSimulator_h
#define DataSimulator_h

// constants 
const float pi = 3.14159;

const float BASE_ACCELERATION = 10.0f;   // km/hr/s
const float BASE_ALTITUDE = 35000.0f;   // ft
const float BASE_SPEED = 900.0f;  // km/hr
const int BASE_TEMPERATURE = 200;    // celsius

// amplitude (ft) and frequency (hz) to control the oscillations while flying
const float ALTITUDE_VARIATION_AMPLITUDE = 1000.0; // ft
const float ALTITUDE_VARIATION_FREQUENCY = 0.01; // hz

const float SPEED_VARIATION_AMPLITUDE = 50.0; // km/hr
const float SPEED_VARIATION_FREQUENCY = 0.2; // hz

const float ACCELERATION_VARIATION_AMPLITUDE = 10.0; // km/h/s
const float ACCELERATION_VARIATION_FREQUENCY = 0.4; // hz

class DataSimulator {
  private:
    // avionic data    
    float currentAcceleration;
    float currentAltitude;
    float currentSpeed;
    int currentTemperature;
    unsigned long startTime;

  public:
    DataSimulator();
    DataSimulator(unsigned long timeInMillis);

    // getter and setters
    float getCurrentAcceleration();
    float getCurrentAltitude();
    float getCurrentSpeed();
    int getCurrentTemperature();

    void setCurrentAcceleration(float acceleration);
    void setCurrentAltitude(float altitude);
    void setCurrentSpeed(float speed);
    void setCurrentTemperature(int temperature);

    // data simulator
    float simulateAltitude(unsigned long timeInMillis);
    float simulateAcceleration(unsigned long timeInMillis);
    float simulateSpeed(unsigned long timeInMillis);
};

#endif