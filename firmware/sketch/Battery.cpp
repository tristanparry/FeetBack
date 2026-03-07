#include "Battery.hpp"

extern "C" void set_arm_clock(uint32_t frequency);

Battery* Battery::instance = nullptr;

Battery::Battery() {
  pinMode(LB_PIN, INPUT);
  pinMode(CMOS_PIN, OUTPUT);
  instance = this;
  lowPowerMode = digitalRead(LB_PIN) == LOW;
  attachInterrupt(digitalPinToInterrupt(LB_PIN), lbISR, CHANGE);
  digitalWrite(CMOS_PIN, lowPowerMode ? LOW : HIGH);
  set_arm_clock(lowPowerMode ? LO_POWER_CLOCK_HZ : HI_POWER_CLOCK_HZ);
}

void Battery::lbISR() {
  if (digitalRead(LB_PIN) == LOW) {
    instance->enterLowPower();
  } else {
    instance->exitLowPower();
  }
}

void Battery::enterLowPower() {
  if (!lowPowerMode) {
    lowPowerMode = true;
    digitalWrite(CMOS_PIN, LOW);
    set_arm_clock(LO_POWER_CLOCK_HZ);
  }
}

void Battery::exitLowPower() {
  if (lowPowerMode) {
    lowPowerMode = false;
    digitalWrite(CMOS_PIN, HIGH);
    set_arm_clock(HI_POWER_CLOCK_HZ);
    I2CSetup();
  }
}

bool Battery::isLowPowerMode() const {
  return lowPowerMode;
}

int16_t Battery::getBatteryLevel() {
  if (lowPowerMode) return LO_BATTERY_MESSAGE;

	// Right insole (divider + clamp circuit)
  // 12-bit ADC: 0-4095 maps to 0-3.3V
  // 100% at 4.14V (count 2070), 0% at 2.39V (count 2047)
  int32_t reading = analogRead(VBAT_PIN);
  int32_t percent = (reading - 2047) * 100 / 23;
  return (int16_t)constrain(percent, 0, 100);

  // Left insole (faulty hardware causing skewed readings)
  // 12-bit ADC: 0-4095 maps to 0-3.3V with some shift due to hardware imperfection
  // 100% at 4.25V (count 1808), 0% at 3.55V (count 1753)
  // int32_t reading = analogRead(VBAT_PIN);
  // int32_t percent = (reading - 1753) * 100 / 55;
  // return (int16_t)constrain(percent, 0, 100);
}