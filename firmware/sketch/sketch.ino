#include "Globals.hpp"
#include "MicroSD.hpp"
#include "SensorReading.hpp"
#include "BLE.hpp"
#include "I2C.hpp"
using namespace std;

#define PERIOD_MS 100
#define PERIOD_OFFSET_MS 50
#define PERIOD_BATTERY_MS 300'000  // Change to new value if desired

MicroSD sd;
CircularBuffer<SensorReading, FIFO_CAPACITY> missedBuffer;
BLE ble;
Battery battery;

void setup() {
  analogReadResolution(12);
  
  sd.init();

  ble.init();
  ble.reset();

  I2CSetup();

  while (ble.status() != READY);
}

void loBatteryLogic() {
  static unsigned long lastBatterySend = 0;

  unsigned long now = millis();

  // Transmit low battery message
  if (now - lastBatterySend >= PERIOD_BATTERY_MS) {
    lastBatterySend = now;

    SensorReading batteryReading;
    char* batteryReadingBuffer = new char[SENSOR_READING_SIZE];
    memset(batteryReadingBuffer, 0, SENSOR_READING_SIZE);
    batteryReading.serialize(batteryReadingBuffer);

    if (ble.status() == READY) {
      ble.send((uint8_t*)batteryReadingBuffer, MTU);
      ble.send((uint8_t*)batteryReadingBuffer + MTU, SENSOR_READING_SIZE - MTU);
    }

    delete[] batteryReadingBuffer;
    batteryReadingBuffer = nullptr;
  }
}

void hiBatteryLogic() {
  static unsigned long lastLiveSend = 0;
  static unsigned long lastSdSend = 0;
  static SensorReading* pendingSdReading = nullptr;
  static int pendingSdIndex = -1;
  static bool sdEmpty = false;

  unsigned long now = millis();

  // Live sensor reading transmission
  if (now - lastLiveSend >= PERIOD_MS) {
    lastLiveSend = now;
    
    SensorReading liveReading;
    char* liveReadingBuffer = new char[SENSOR_READING_SIZE];
    memset(liveReadingBuffer, 0, SENSOR_READING_SIZE);
    liveReading.serialize(liveReadingBuffer);

    if (ble.status() == READY) {
      ble.send((uint8_t*)liveReadingBuffer, MTU);
      ble.send((uint8_t*)liveReadingBuffer + MTU, SENSOR_READING_SIZE - MTU);
    } else {
      if (!missedBuffer.isFull()) {
        missedBuffer.push(liveReading);
      } else {
        if (sd.batchWrite(missedBuffer)) {
          missedBuffer.clear();
          sdEmpty = false;
        }
      }
    }

    delete[] liveReadingBuffer;
    liveReadingBuffer = nullptr;
  }

  // Transmit backlog SD data (if exists)
  if (now - lastSdSend >= PERIOD_MS + PERIOD_OFFSET_MS) {
    lastSdSend = now;

    if (!pendingSdReading && !sdEmpty) {
      pair<char*, int> sdReading = sd.readNext();
      if (sdReading.first != nullptr) {
        pendingSdReading = new SensorReading(SensorReading::deserialize(sdReading.first));
        pendingSdIndex = sdReading.second;
        delete[] sdReading.first;
        sdReading.first = nullptr;
      } else {
        sdEmpty = true;
      }
    }

    if (pendingSdReading) {
      char* sdReadingBuffer = new char[SENSOR_READING_SIZE];
      memset(sdReadingBuffer, 0, SENSOR_READING_SIZE);
      pendingSdReading->serialize(sdReadingBuffer);

      if (
        ble.send((uint8_t*)sdReadingBuffer, MTU) && ble.send((uint8_t*)sdReadingBuffer + MTU, SENSOR_READING_SIZE - MTU)) {
        sd.clearReading(pendingSdIndex);
        delete pendingSdReading;
        pendingSdReading = nullptr;
        pendingSdIndex = -1;
        sdEmpty = false;
      }

      delete[] sdReadingBuffer;
      sdReadingBuffer = nullptr;
    }
  }
}

void loop() {
  if (battery.isLowPowerMode()) {
    loBatteryLogic();
  } else {
    hiBatteryLogic();
  }
}