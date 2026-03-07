#include "BLE.hpp"

BLE::BLE() = default;

void BLE::init() {
    UART_SERIAL.begin(115200);

    pinMode(RESET_N, OUTPUT);
    pinMode(P2_0, OUTPUT);
    pinMode(Status1_IND, INPUT);
    pinMode(Status2_IND, INPUT);
    pinMode(UART_RX_IND, OUTPUT);
    pinMode(RTS, OUTPUT);
    pinMode(CTS, INPUT);

    digitalWrite(UART_RX_IND, HIGH);
}

void BLE::config() {
    digitalWrite(P2_0, LOW);
    digitalWrite(RESET_N, LOW);
    delay(3);
    digitalWrite(RESET_N, HIGH);
}

void BLE::reset() {
    digitalWrite(P2_0, HIGH);
    digitalWrite(RESET_N, LOW);
    delay(3);
    digitalWrite(RESET_N, HIGH);
}

int BLE::status() {
    switch ((digitalRead(Status1_IND) << 1) | digitalRead(Status2_IND)) {
        case 0b00: return CONNECTED;
        case 0b01: return READY;
        case 0b10: return STANDBY;
        case 0b11: return SHUTDOWN;
        default:   return SHUTDOWN; // fallback, unreachable
    }
}

bool BLE::send(uint8_t* data, size_t length) {
    if (status() != READY) return false;

    digitalWrite(UART_RX_IND, LOW);
    delay(3);

    size_t sent = 0;

    if (digitalRead(RTS) == LOW) {
        digitalWrite(CTS, LOW);

        sent = UART_SERIAL.write(data, length);

        digitalWrite(CTS, HIGH);
    }

    UART_SERIAL.flush();
    digitalWrite(UART_RX_IND, HIGH);

    return sent == length;
}

void BLE::read() {
    while (UART_SERIAL.available()) {
        int incoming = UART_SERIAL.read();
        Serial.write(incoming);
    }
}
