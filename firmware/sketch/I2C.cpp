#include "I2C.hpp"

Adafruit_BNO055 bno(BNO055_ID, BNO055_ADDR, &Wire2);

void I2CSetup() {
  Wire2.setSDA(SDA_PIN);
  Wire2.setSCL(SCL_PIN);
  Wire2.begin();
  Wire2.setClock(I2C_CLOCK_HZ);
  
  // scanI2C();
  if (!bno.begin()) {
    // Serial.println("BNO055 not detected. Check wiring or I2C address!");
    return;
  }
  bno.setMode(OPERATION_MODE_NDOF);
  bno.setExtCrystalUse(true);
  // Serial.println("BNO055 Ready");

  Wire2.beginTransmission(ADC_ADDR);
  if (Wire2.endTransmission() == 0) {
    // Serial.println("ADC detected at 0x4D.");
  } else {
    // Serial.println("ADC not detected at 0x4D. Check wiring!");
  }
}

imu::Vector<3> getEulerReadings() {
  return bno.getVector(Adafruit_BNO055::VECTOR_EULER);
}

imu::Quaternion getQuatReadings() {
  return bno.getQuat();
}

uint16_t getAlignment() {
  imu::Vector<3> euler = getEulerReadings();
  float pitch = euler.y();
  float roll = euler.z();
  float heading = euler.x();

  const float MAX_PITCH = 25.0;
  const float MAX_ROLL = 25.0;

  return (abs(pitch) <= MAX_PITCH && abs(roll) <= MAX_ROLL)
    ? static_cast<uint16_t>(round(fmod(heading + 360.0f, 360.0f)))
    : ERR_ALIGN_READING;
}

int8_t getThermistorReading() {
  const float SERIES_RESISTOR = 10000.0;
  const float NOMINAL_RESISTANCE = 10000.0;
  const float NOMINAL_TEMPERATURE = 25.0;
  const float BETA = 3375.0;
  const float ADC_MAX = 1023.0;

  uint16_t adcValue = 0;
  Wire2.requestFrom(ADC_ADDR, (uint8_t)2);
  if (Wire2.available() == 2) {
    uint8_t msb = Wire2.read();
    uint8_t lsb = Wire2.read();
    adcValue = ((msb & 0x0F) << 6 | (lsb >> 2));
    if (adcValue == 0 || adcValue >= ADC_MAX) return ERR_TEMP_READING;

    float voltageRatio = adcValue / ADC_MAX;
    float resistance = SERIES_RESISTOR * (1.0 / voltageRatio - 1.0);
    float steinhart;
    steinhart = resistance / NOMINAL_RESISTANCE;
    steinhart = log(steinhart);
    steinhart /= BETA;
    steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);
    steinhart = 1.0 / steinhart;
    steinhart -= 273.15;

    int tempC = static_cast<int>(round(steinhart));
    tempC = constrain(tempC, -128, 127);
    return static_cast<int8_t>(tempC);
  } else {
    return ERR_TEMP_READING;
  }
}



// DEBUG
void scanI2C() {
  Serial.println("Scanning I2C bus...");
  Wire2.beginTransmission(0);
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire2.beginTransmission(addr);
    if (Wire2.endTransmission() == 0) {
      Serial.print("Found device at 0x");
      Serial.println(addr, HEX);
    }
  }
  Serial.println("Scan complete.");
}

