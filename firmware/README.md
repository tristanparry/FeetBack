# FeetBack Firmware

This repository is used for various FeetBack firmware. The repo contains the embedded code used to read force sensors, buffer data to microSD, and transmit readings over BLE to the FeetBack mobile app.

## Getting started

1. Open the `sketch/sketch.ino` file in the Arduino IDE or import the folder into PlatformIO.

2. Connect Teensy 4.0 MCU to computer.

3. Build and upload using your preferred toolchain (Arduino IDE / Arduino CLI / PlatformIO).

Note: This code assumes an environment where `Arduino.h` is available. If you use a non-Arduino toolchain, adapt the build and platform settings accordingly.
