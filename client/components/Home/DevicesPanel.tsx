import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import { getBatteryIconName } from '@/utils/UI/battery';
import BLEConnectionIndicator from '@/components/BLE/BLEConnectionIndicator';
import { LOW_BATTERY_LEVEL } from '@/constants/sensors';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { useTranslation } from 'react-i18next';
import { DeviceInfo } from '@/types/ble';
import { BLE_DEVICE_NAMES } from '@/constants/ble';
import { useBLE } from '@/contexts/BLE';
import { useAuth } from '@/contexts/Auth';
import SmallActionButton from '@/components/UI/SmallActionButton';
import AlertModal from '@/components/UI/AlertModal';
import { useState } from 'react';
import Button from '@/components/UI/Button';
import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/core';

type DevicesPanelProps = {
  manageInsolesScreen?: boolean;
  className?: string;
};
type PairDevicesInfoButtonProps = DevicesPanelProps;

const DevicesPanel = ({
  manageInsolesScreen = false,
  className,
}: DevicesPanelProps) => {
  const { user } = useAuth();
  const { pairedDevices, unpairDevice } = useBLE();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const bothInsolesPaired = pairedDevices.length === BLE_DEVICE_NAMES.length;

  const closeModal = () => {
    setShowAlert(false);
    setSelectedDevice(null);
  };

  const getInsoleName = (device: DeviceInfo) =>
    t(`manageInsoles.${device.foot}`, { userName: user?.name });

  if (!pairedDevices.length)
    return (
      <View className="mx-auto flex items-center pb-4">
        <Text className="my-2 text-lg font-light text-secondary-text">
          {t('manageInsoles.noDevices')}
        </Text>
        <PairDevicesInfoButton
          manageInsolesScreen={manageInsolesScreen}
          className="mt-4"
        />
      </View>
    );

  return (
    <>
      <FadeAnimation
        transparency={false}
        className={clsx('flex-1', manageInsolesScreen && 'justify-between')}
      >
        <View
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            shadowColor: 'hsl(0, 0, 0%)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          className={clsx(
            'mx-1 flex bg-secondary-background p-4 mb-4',
            className,
          )}
        >
          {pairedDevices.map((device, index) => (
            <View
              key={index}
              className={clsx(
                'flex-row items-center justify-between',
                index !== 0 &&
                  'mt-4 border-t-[0.25px] border-tertiary-background pt-4',
              )}
            >
              <View className="flex-shrink flex-row items-center">
                <Text className="mr-2 flex-shrink text-primary-text">
                  {getInsoleName(device)}
                </Text>
                {manageInsolesScreen && (
                  <SmallActionButton
                    iconName="unlink-outline"
                    iconSize={16}
                    iconClassName="text-secondary-text -rotate-45"
                    onPress={() => {
                      setSelectedDevice(device);
                      setShowAlert(true);
                    }}
                  />
                )}
              </View>
              <FadeAnimation axis="horizontal">
                <View className="flex-row items-center">
                  <BLEConnectionIndicator device={device} />
                  {device.isConnected && (
                    <MaterialCommunityIcons
                      name={getBatteryIconName(device.batteryLevel)}
                      size={20}
                      color={colors.primaryAccent}
                      className="ml-2 mr-[1px]"
                    />
                  )}
                  {device.isConnected &&
                    device.batteryLevel &&
                    device.batteryLevel !== LOW_BATTERY_LEVEL && (
                      <Text className="font-medium text-primary-accent">
                        {device.batteryLevel}%
                      </Text>
                    )}
                </View>
              </FadeAnimation>
            </View>
          ))}
        </View>
        {!bothInsolesPaired && manageInsolesScreen && (
          <View className="mx-auto">
            <PairDevicesInfoButton
              manageInsolesScreen={manageInsolesScreen}
              className="mb-4"
            />
          </View>
        )}
      </FadeAnimation>
      <AlertModal
        isVisible={showAlert}
        onClose={closeModal}
        title={t('manageInsoles.functions.unpairInsole.title')}
        message={t('manageInsoles.functions.unpairInsole.description', {
          insoleName: selectedDevice ? getInsoleName(selectedDevice) : '',
        })}
        cancelText={t('common.no')}
        onCancel={closeModal}
        confirmText={t('common.yes')}
        onConfirm={async () => {
          if (selectedDevice) await unpairDevice(selectedDevice.serial);
          closeModal();
        }}
      />
    </>
  );
};

const PairDevicesInfoButton = ({
  manageInsolesScreen = false,
  className,
}: PairDevicesInfoButtonProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  return (
    <>
      <Button
        text={t('manageInsoles.functions.pairInsole.title')}
        textSize={12}
        iconName="link-outline"
        iconSize={20}
        secondaryButtonStyle
        onPress={() => setShowAlert(true)}
        className={clsx(
          'rounded-bl-full rounded-br-full rounded-tl-full rounded-tr-full pb-2 pl-4 pr-4 pt-2',
          className,
        )}
      />
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('manageInsoles.functions.pairInsole.title')}
        message={t('manageInsoles.functions.pairInsole.description')}
        confirmText={t('common.ok')}
        onConfirm={() => {
          setShowAlert(false);
          if (manageInsolesScreen) setShouldRedirect(true);
        }}
        onDismissFinished={() => {
          if (shouldRedirect) {
            setShouldRedirect(false);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: '(tabs)' }],
              }),
            );
          }
        }}
      />
    </>
  );
};

export default DevicesPanel;
