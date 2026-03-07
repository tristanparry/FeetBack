#pragma once
#include "I2C.hpp"
#include <Arduino.h>

constexpr uint8_t VBAT_PIN = 27;
constexpr uint8_t LB_PIN = 11;
constexpr uint8_t CMOS_PIN = 0;

constexpr uint32_t HI_POWER_CLOCK_HZ = 150'000'000;
constexpr uint32_t LO_POWER_CLOCK_HZ = 16'000'000;

constexpr uint16_t LO_BATTERY_MESSAGE = 0xFFFF;

class Battery {
  public:
    Battery();
    static void lbISR();
    void enterLowPower();
    void exitLowPower();
    bool isLowPowerMode() const;
    int16_t getBatteryLevel();
  private:
    volatile bool lowPowerMode;
    static Battery* instance;
};