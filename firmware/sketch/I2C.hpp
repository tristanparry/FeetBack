#pragma once

#define byte uint8_t

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>

constexpr uint8_t SDA_PIN = 36;
constexpr uint8_t SCL_PIN = 35;
constexpr uint32_t I2C_CLOCK_HZ = 400'000;
constexpr uint8_t BNO055_ADDR = 0x28;
constexpr uint8_t ADC_ADDR = 0x4D;
constexpr int8_t ERR_TEMP_READING = 0x80;
constexpr uint16_t ERR_ALIGN_READING = 0xFFFF;

extern Adafruit_BNO055 bno;

void I2CSetup();
imu::Vector<3> getEulerReadings();
imu::Quaternion getQuatReadings();
uint16_t getAlignment();
int8_t getThermistorReading();


// DEBUG
void scanI2C();