#include "DataSimulator.h"
#include <iostream>
#include <cmath>
#include <stdlib.h>
#include <math.h>
#include <random>



DataSimulator::DataSimulator() {
  currentAcceleration = BASE_ACCELERATION;
  currentAltitude = BASE_ALTITUDE;
  currentSpeed = BASE_SPEED;
  currentTemperature = BASE_TEMPERATURE;

  std::cout << "Data Simulator object instantiated!\n";
}

DataSimulator::DataSimulator(unsigned long timeInMillis) {
  currentAcceleration = BASE_ACCELERATION;
  currentAltitude = BASE_ALTITUDE;
  currentSpeed = BASE_SPEED;
  currentTemperature = BASE_TEMPERATURE;
  startTime = timeInMillis;

  std::cout << "Parameterized Data Simulator object instantiated!\n";
}

float DataSimulator::getCurrentAcceleration() {
  return currentAcceleration;
}

float DataSimulator::getCurrentAltitude() {
  return currentAltitude;
}

float DataSimulator::getCurrentSpeed() {
  return currentSpeed;
}

int DataSimulator::getCurrentTemperature() {
  return currentTemperature;
}

void DataSimulator::setCurrentAcceleration(float acceleration) {
  this->currentAcceleration = acceleration;
}

void DataSimulator::setCurrentAltitude(float altitude) {
  this->currentAltitude = altitude;
}

void DataSimulator::setCurrentSpeed(float speed) {
  this->currentSpeed = speed;
}

void DataSimulator::setCurrentTemperature(int temperature) {
  this->currentTemperature = temperature;
}

// returns altitude in feet
float DataSimulator::simulateAltitude(unsigned long timeInMillis) {
  float currentTime = (timeInMillis - startTime) / 1000.0;  // seconds

  return BASE_ALTITUDE + (ALTITUDE_VARIATION_AMPLITUDE * sin(2 * pi * ALTITUDE_VARIATION_FREQUENCY * currentTime));
}

float DataSimulator::simulateAcceleration(unsigned long timeInMillis) {
  float currentTime = (timeInMillis - startTime) / 1000.0f;

  return BASE_ACCELERATION + (ACCELERATION_VARIATION_AMPLITUDE * sin(2 * pi * ACCELERATION_VARIATION_FREQUENCY * currentTime));
}

float DataSimulator::simulateSpeed(unsigned long timeInMillis) {
  float currentTime = (timeInMillis - startTime) / 1000.0f;

  return BASE_SPEED + (SPEED_VARIATION_AMPLITUDE * sin(2 * pi * SPEED_VARIATION_FREQUENCY * currentTime));
}
