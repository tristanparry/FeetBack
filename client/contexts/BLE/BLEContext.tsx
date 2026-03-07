import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { BLEDevice } from '@/utils/BLE/BLEDevice';
import {
  BLE_DEVICE_NAMES,
  BLE_LEFT_DEVICE_NAME,
  BLE_RIGHT_DEVICE_NAME,
  LEFT_FOOT_KEY,
  BLE_SCAN_TIMEOUT,
  BLE_BATTERY_UPDATE_INTERVAL,
} from '@/constants/ble';
import { DeviceInfo, ConnectionState } from '@/types/ble';
import { SensorReading } from '@/types/sensors';
import { SensorReadingEmitter } from '@/utils/Sensors/SensorReadingEmitter';
import { useAuth } from '@/contexts/Auth';
import { getUserInsoles, unpairInsole } from '@/utils/api/routes/insoles';

type BLEContextType = {
  pairedDevices: DeviceInfo[];
  connectionState: ConnectionState;
  requestPermissions: () => Promise<boolean>;
  findBLEs: () => Promise<void>;
  disconnectAllBLEs: () => Promise<void>;
  cancelBLEScan: () => void;
  isScanning: boolean;
  unpairDevice: (serial: DeviceInfo['serial']) => void;
};

const BLEContext = createContext<BLEContextType | undefined>(undefined);
export const useBLE = () => useContext(BLEContext)!;

export const BLEProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const bleManager = useMemo(() => new BleManager(), []);
  const [pairedDevices, setPairedDevices] = useState<DeviceInfo[]>([]);
  const bleDeviceRefs = useRef<Map<DeviceInfo['serial'], BLEDevice>>(new Map());
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Idle,
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectingDeviceIDs = useRef<Set<string>>(new Set());
  const batteryLevelsRef = useRef<Map<DeviceInfo['serial'], number | null>>(
    new Map(),
  );
  const batteryUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const bleScanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
        const bleConnectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
        const bleFineLocationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return (
          bleScanPermission === 'granted' &&
          bleConnectPermission === 'granted' &&
          bleFineLocationPermission === 'granted'
        );
      }
    }
    return true;
  };

  const computeConnectionState = (
    devices: DeviceInfo[],
    scanning: boolean,
    connecting: boolean,
  ): ConnectionState => {
    const connectedCount = devices.filter((ble) => ble.isConnected).length;
    if (connecting) return ConnectionState.Connecting;
    if (scanning && connectedCount === 0) return ConnectionState.Scanning;
    if (connectedCount === BLE_DEVICE_NAMES.length)
      return ConnectionState.ConnectedFull;
    if (connectedCount > 0) return ConnectionState.ConnectedPartial;
    return scanning ? ConnectionState.Scanning : ConnectionState.Idle;
  };

  const refreshPairedDevices = async (unpairCall: boolean = false) => {
    if (!user) return;
    try {
      const res = unpairCall ? { data: [] } : await getUserInsoles();
      const refreshedDevices: DeviceInfo[] = await Promise.all(
        (res.data || []).map(async (insole: any) => {
          const bleRef = bleDeviceRefs.current.get(insole.insole_id);
          const isConnected = bleRef
            ? await bleRef
                .getDevice()
                .isConnected()
                .catch(() => false)
            : false;
          if (!isConnected && bleRef)
            bleDeviceRefs.current.delete(insole.insole_id);
          return {
            serial: insole.insole_id,
            name:
              insole.foot === LEFT_FOOT_KEY
                ? BLE_LEFT_DEVICE_NAME
                : BLE_RIGHT_DEVICE_NAME,
            foot: insole.foot,
            isConnected,
            batteryLevel: null,
          };
        }),
      );
      setPairedDevices(refreshedDevices);
    } catch (e) {
      console.warn('Failed to fetch paired devices:', e);
    }
  };

  const unpairDevice = async (serial: DeviceInfo['serial']) => {
    if (!user) return false;
    try {
      const ble = bleDeviceRefs.current.get(serial);
      if (ble) {
        await ble.disconnect();
        bleDeviceRefs.current.delete(serial);
      }
      batteryLevelsRef.current.delete(serial);
      await unpairInsole(serial);
      await refreshPairedDevices(true);
    } catch (e) {
      console.error('Failed to unpair device:', e);
    }
  };

  const cancelBLEScan = () => {
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    bleManager.stopDeviceScan();
    setIsScanning(false);
    if (
      [ConnectionState.Scanning, ConnectionState.Connecting].includes(
        connectionState,
      )
    ) {
      setConnectionState(ConnectionState.Idle);
    }
  };

  const disconnectAllBLEs = async () => {
    if (connectionState === ConnectionState.Disconnecting) return;
    setConnectionState(ConnectionState.Disconnecting);
    cancelBLEScan();
    try {
      await Promise.allSettled(
        [...bleDeviceRefs.current.values()].map((ble) => ble.disconnect()),
      );
      bleDeviceRefs.current.clear();
      await refreshPairedDevices();
    } catch (e) {
      console.error('Error disconnecting BLE devices:', e);
    } finally {
      setConnectionState(ConnectionState.Idle);
    }
  };

  const connectToBLE = async (device: Device) => {
    if (!user || connectingDeviceIDs.current.has(device.id)) return;
    connectingDeviceIDs.current.add(device.id);

    try {
      if (
        [...bleDeviceRefs.current.values()].some(
          (ble) => ble.getDevice().id === device.id,
        )
      ) {
        connectingDeviceIDs.current.delete(device.id);
        return;
      }

      const ble = new BLEDevice(bleManager, device, async (serial) => {
        bleDeviceRefs.current.delete(serial);
        batteryLevelsRef.current.delete(serial);
        setPairedDevices((prev) =>
          prev.map((ble) =>
            ble.serial === serial
              ? { ...ble, isConnected: false, batteryLevel: null }
              : ble,
          ),
        );
        await refreshPairedDevices();
      });
      const connected = await ble.connect(user.user_id);
      if (!connected) return;

      bleDeviceRefs.current.set(connected.serial, ble);
      await refreshPairedDevices();
    } catch (e) {
      console.error('Error connecting to BLE device:', e);
    } finally {
      connectingDeviceIDs.current.delete(device.id);
    }
  };

  const findBLEs = async (): Promise<void> => {
    if (
      [ConnectionState.Scanning, ConnectionState.Connecting].includes(
        connectionState,
      )
    )
      return;
    setConnectionState(ConnectionState.Scanning);
    setIsScanning(true);

    const expectedDeviceNames = new Set(BLE_DEVICE_NAMES);
    const foundDeviceNames = new Set<DeviceInfo['name']>();

    bleManager.state().then((state) => {
      if (state !== 'PoweredOn') return;

      bleManager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          cancelBLEScan();
          return;
        }

        if (!device?.name || !expectedDeviceNames.has(device.name)) return;

        setConnectionState(ConnectionState.Connecting);
        await connectToBLE(device);

        foundDeviceNames.add(device.name);
        if (
          [...expectedDeviceNames].every((name) => foundDeviceNames.has(name))
        ) {
          cancelBLEScan();
          await refreshPairedDevices();
        }
      });
    });

    scanTimeout.current = setTimeout(() => {
      cancelBLEScan();
      setIsScanning(false);
      refreshPairedDevices();
    }, BLE_SCAN_TIMEOUT);
  };

  useEffect(() => {
    const handleReading = ({
      device,
      reading,
    }: {
      device: DeviceInfo;
      reading: SensorReading;
    }) => {
      batteryLevelsRef.current.set(device.serial, reading.batteryLevel);
    };

    SensorReadingEmitter.onReading(handleReading);
    return () => {
      SensorReadingEmitter.removeReadingListener(handleReading);
    };
  }, []);

  useEffect(() => {
    batteryUpdateInterval.current = setInterval(() => {
      setPairedDevices((prev) => {
        let hasChanges = false;
        const updated = prev.map((device) => {
          const newBattery = batteryLevelsRef.current.get(device.serial);
          if (newBattery !== undefined && device.batteryLevel !== newBattery) {
            hasChanges = true;
            return { ...device, batteryLevel: newBattery };
          }
          return device;
        });
        return hasChanges ? updated : prev;
      });
    }, BLE_BATTERY_UPDATE_INTERVAL);

    return () => {
      if (batteryUpdateInterval.current) {
        clearInterval(batteryUpdateInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    refreshPairedDevices();
  }, [user]);

  useEffect(() => {
    const autoReconnect = async () => {
      if (
        !user ||
        isScanning ||
        connectionState !== ConnectionState.Idle ||
        AppState.currentState === 'active'
      )
        return;
      const hasUnconnectedDevices = pairedDevices.some(
        (device) => !device.isConnected,
      );
      if (hasUnconnectedDevices && pairedDevices.length > 0) {
        const granted = await requestPermissions();
        if (granted) await findBLEs();
      }
    };

    if (user && pairedDevices.length > 0) {
      const allConnected = pairedDevices.every((device) => device.isConnected);
      if (!allConnected) {
        const timer = setTimeout(() => {
          autoReconnect();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [pairedDevices, user, isScanning, connectionState]);

  useEffect(() => {
    return () => {
      cancelBLEScan();
      disconnectAllBLEs();
      bleManager.destroy();
      if (batteryUpdateInterval.current) {
        clearInterval(batteryUpdateInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    const newState = computeConnectionState(
      pairedDevices,
      isScanning,
      connectingDeviceIDs.current.size > 0,
    );
    if (connectionState !== newState) setConnectionState(newState);
    if (newState === ConnectionState.ConnectedFull && isScanning) {
      if (connectionState !== ConnectionState.Idle) cancelBLEScan();
    }
  }, [pairedDevices, isScanning]);

  return (
    <BLEContext.Provider
      value={{
        pairedDevices,
        connectionState,
        requestPermissions,
        findBLEs,
        disconnectAllBLEs,
        cancelBLEScan,
        isScanning,
        unpairDevice,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};
