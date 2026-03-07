import { BLE_DEVICE_NAMES, FOOT_KEYS } from '@/constants/ble';

export type DeviceInfo = {
  serial: string;
  name: (typeof BLE_DEVICE_NAMES)[number];
  foot: (typeof FOOT_KEYS)[number];
  isConnected: boolean;
  batteryLevel: number | null;
};

export enum ConnectionState {
  Idle = 'idle',
  Scanning = 'scanning',
  Connecting = 'connecting',
  ConnectedPartial = 'connected-partial',
  ConnectedFull = 'connected-full',
  Disconnecting = 'disconnecting',
  Error = 'error',
}

export enum ConnectionType {
  Continuous = 'continuous',
  Intermittent = 'intermittent',
  None = 'none',
}

