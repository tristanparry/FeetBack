#pragma once
#include <Arduino.h>

#define UART_SERIAL Serial2
#define MTU 20

#define RESET_N 2
#define P2_0 3
#define RTS 4
#define CTS 5
#define Status1_IND 9
#define Status2_IND 10
#define UART_RX_IND 12

#define SHUTDOWN 1 // Deep sleep
#define STANDBY 2 // Advertising
#define CONNECTED 3 // Connected but not ready for data
#define READY 4 // Ready for data

class BLE {
    public:
        BLE();
        void init();
        void config();
        void reset();
        int status();
        bool send(uint8_t* data, size_t length);
        void read();
};
