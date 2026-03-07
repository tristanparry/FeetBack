#include "SensorReading.hpp"
#include "Globals.hpp"

SensorReading::SensorReading() {
  start = START_FLAG;
  batteryLevel = protectStartFlag(battery.getBatteryLevel());
  alignment = protectStartFlag(getAlignment());
  temperature = protectStartFlag(getThermistorReading());
  timestamp = protectStartFlag(millis());
  memset(forceSensors, 0, sizeof(forceSensors));
  for (size_t i = 0; i < NUM_FORCE_SENSORS; i++) {
    forceSensors[i] = protectStartFlag(analogRead(FORCE_SENSOR_PINS[i]));
  }
}

void SensorReading::print() const {
  Serial.print("Start: ");
  Serial.println(char(start));
  Serial.print("Battery Level: ");
  Serial.println(batteryLevel);
  Serial.print("Alignment: ");
  Serial.println(alignment);
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.println("Force Sensors: ");
  for (size_t i = 0; i < NUM_FORCE_SENSORS; i++) {
    Serial.print("Force[");
    Serial.print(i);
    Serial.print("]: ");
    Serial.println(forceSensors[i]);
  }
  Serial.print("Timestamp: ");
  Serial.println(timestamp);
}

SensorReading SensorReading::deserialize(const char* buffer) {
  SensorReading reading;
  memcpy(&reading, buffer, sizeof(SensorReading));
  return reading;
}

void SensorReading::serialize(char* buffer) const {
  memcpy(buffer, this, sizeof(SensorReading));
}

template <typename T> T SensorReading::protectStartFlag(T val) {
  uint8_t* p = reinterpret_cast<uint8_t*>(&val);
  for (size_t i = 0; i < sizeof(T); ++i) {
    if (p[i] == START_FLAG) {
      p[i] += 1;
    }
  }
  return val;
}
