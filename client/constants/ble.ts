// BLE Device Names and Identifiers
export const LEFT_FOOT_KEY = 'L';
export const RIGHT_FOOT_KEY = 'R';
export const FOOT_KEYS = [LEFT_FOOT_KEY, RIGHT_FOOT_KEY];
export const BLE_LEFT_DEVICE_NAME = 'FeetBackBLELeft';
export const BLE_RIGHT_DEVICE_NAME = 'FeetBackBLERight';
export const BLE_DEVICE_NAMES = [BLE_LEFT_DEVICE_NAME, BLE_RIGHT_DEVICE_NAME];

// BLE UUIDs
export const UART_SERVICE_UUID =
  process.env.EXPO_PUBLIC_UART_SERVICE_UUID ?? '';
export const TX_UUID = process.env.EXPO_PUBLIC_TX_UUID ?? '';
export const DEVICE_INFO_UUID = process.env.EXPO_PUBLIC_DEVICE_INFO_UUID ?? '';
export const SERIAL_NUM_UUID = process.env.EXPO_PUBLIC_SERIAL_NUM_UUID ?? '';

// BLE Scanning
export const BLE_SCAN_TIMEOUT = 60_000;
export const BLE_BATTERY_UPDATE_INTERVAL = 10_000;