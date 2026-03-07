#pragma once

#include "I2C.hpp"
#include <Arduino.h>

#define SENSOR_READING_SIZE sizeof(SensorReading)
#define START_FLAG 'S'
#define NUM_FORCE_SENSORS 11

constexpr uint8_t FORCE_SENSOR_PINS[NUM_FORCE_SENSORS] = {
  A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A12
};

#pragma pack(push, 1)
class SensorReading {
  public:
    SensorReading();
    void print() const;
    static SensorReading deserialize(const char* buffer);
    void serialize(char* buffer) const;
    uint8_t start = START_FLAG;
    int16_t batteryLevel;
    uint16_t alignment;
    int8_t temperature;
    uint16_t forceSensors[NUM_FORCE_SENSORS];
    uint32_t timestamp;
  private:
    template <typename T> T protectStartFlag(T val);
};
#pragma pack(pop)
