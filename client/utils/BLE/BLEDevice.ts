import { Buffer } from 'buffer';
import {
  BLE_LEFT_DEVICE_NAME,
  DEVICE_INFO_UUID,
  LEFT_FOOT_KEY,
  RIGHT_FOOT_KEY,
  SERIAL_NUM_UUID,
  TX_UUID,
  UART_SERVICE_UUID,
} from '@/constants/ble';
import { DeviceInfo } from '@/types/ble';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import {
  extractBufferedData,
  flushReadingsBatch,
  resetAnchors,
} from '@/utils/Sensors/DataProcessing';
import { getInsoleByID, pairInsole } from '@/utils/api/routes/insoles';
import { SensorReadingEmitter } from '@/utils/Sensors/SensorReadingEmitter';

const SETTLING_DELAY = 200;
const CONNECTION_TIMEOUT = 10_000;

export class BLEDevice {
  private bleManager: BleManager;
  private device: Device;
  private name: DeviceInfo['name'];
  private serial: DeviceInfo['serial'] | null;
  private foot: DeviceInfo['foot'];
  private uartSubscription: Subscription | null;
  private buffer: Buffer = Buffer.alloc(0);
  private onDisconnect: (serial: DeviceInfo['serial']) => void;

  constructor(
    bleManager: BleManager,
    device: Device,
    onDisconnect: (serial: DeviceInfo['serial']) => void,
  ) {
    this.bleManager = bleManager;
    this.device = device;
    this.name = device.name ?? '';
    this.serial = null;
    this.foot =
      device.name === BLE_LEFT_DEVICE_NAME ? LEFT_FOOT_KEY : RIGHT_FOOT_KEY;
    this.uartSubscription = null;
    this.onDisconnect = onDisconnect;
  }

  public getDevice(): Device {
    return this.device;
  }

  public async connect(
    userID: number,
  ): Promise<Pick<DeviceInfo, 'serial' | 'foot'> | null> {
    try {
      await this.ensureDisconnected();

      const connectedBLE = await this.bleManager.connectToDevice(
        this.device.id,
        { timeout: CONNECTION_TIMEOUT },
      );

      await connectedBLE.discoverAllServicesAndCharacteristics();
      await new Promise((res) => setTimeout(res, SETTLING_DELAY));

      const serialNumberCharacteristic =
        await connectedBLE.readCharacteristicForService(
          DEVICE_INFO_UUID,
          SERIAL_NUM_UUID,
        );
      const serialNumber = serialNumberCharacteristic?.value
        ? Buffer.from(serialNumberCharacteristic?.value, 'base64')
            .toString('utf-8')
            .trim()
        : null;
      if (!serialNumber) {
        await connectedBLE.cancelConnection();
        return null;
      }
      this.serial = serialNumber;

      try {
        const response = await getInsoleByID(serialNumber);
        const insole = response.data;
        if (!insole) {
          await connectedBLE.cancelConnection();
          return null;
        }
      } catch (e: any) {
        if (e.response?.status === 404) {
          await pairInsole(serialNumber, { foot: this.foot });
        } else {
          await connectedBLE.cancelConnection();
          return null;
        }
      }

      this.device = connectedBLE;
      this.bleManager.onDeviceDisconnected(this.device.id, async (error, _) => {
        if (error) {
          return;
        }
        if (this.serial) {
          await flushReadingsBatch(this.serial);
          this.onDisconnect(this.serial);
        }
      });

      this.monitorUART();
      return { serial: serialNumber, foot: this.foot };
    } catch (e) {
      await this.ensureDisconnected();
      return null;
    }
  }

  private monitorUART() {
    this.uartSubscription = this.device.monitorCharacteristicForService(
      UART_SERVICE_UUID,
      TX_UUID,
      (error, characteristic) => {
        if (error) {
          if (error.message?.includes('disconnected')) {
            this.disconnect();
          }
          return;
        }

        const data = characteristic?.value;
        if (!data) return;

        this.buffer =
          extractBufferedData(
            Buffer.concat([this.buffer, Buffer.from(data, 'base64')]),
            {
              name: this.name,
              serial: this.serial ?? '',
              foot: this.foot,
              isConnected: this.uartSubscription !== null,
              batteryLevel: null,
            },
          ) ?? Buffer.alloc(0);
      },
    );
  }

  public async disconnect(): Promise<string | null> {
    try {
      if (this.uartSubscription) {
        this.uartSubscription.remove();
        this.uartSubscription = null;
      }
      await this.ensureDisconnected();
      if (this.serial) {
        resetAnchors(this.serial);
        await flushReadingsBatch(this.serial);
        SensorReadingEmitter.emitDisconnect({
          name: this.name,
          serial: this.serial,
          foot: this.foot,
          isConnected: false,
          batteryLevel: null,
        });
        this.onDisconnect(this.serial);
      }
      return this.serial;
    } catch (e) {
      return null;
    }
  }

  private async ensureDisconnected() {
    try {
      if (await this.device.isConnected()) {
        await this.device.cancelConnection();
      }
      await this.bleManager.cancelDeviceConnection(this.device.id);
    } catch (_) {}
  }
}
