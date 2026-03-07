import { Pressable, Animated, Easing } from 'react-native';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { LOW_BATTERY_LEVEL } from '@/constants/sensors';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import { DeviceInfo, ConnectionType } from '@/types/ble';
import { useTranslation } from 'react-i18next';
import AlertModal from '@/components/UI/AlertModal';
import { useAuth } from '@/contexts/Auth';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

type BLEConnectionIndicatorProps = {
  device: DeviceInfo;
  size?: number;
  className?: string;
};

const BLEConnectionIndicator = ({
  device,
  size = 10,
  className,
}: BLEConnectionIndicatorProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const isBatteryLevelGood =
    device.batteryLevel && device.batteryLevel !== LOW_BATTERY_LEVEL;

  const connectionType: ConnectionType = device.isConnected
    ? isBatteryLevelGood
      ? ConnectionType.Continuous
      : ConnectionType.Intermittent
    : ConnectionType.None;

  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (
      [ConnectionType.Continuous, ConnectionType.Intermittent].includes(
        connectionType,
      )
    ) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration:
              connectionType === ConnectionType.Continuous ? 1000 : 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration:
              connectionType === ConnectionType.Continuous ? 1000 : 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      opacityAnim.stopAnimation();
      opacityAnim.setValue(1);
    }
  }, [connectionType]);

  const bgColor =
    connectionType === ConnectionType.Continuous
      ? colors.success
      : connectionType === ConnectionType.Intermittent
        ? colors.warning
        : colors.error;

  return (
    <>
      <Pressable
        className="p-2"
        onPress={() => setShowAlert(true)}
        hitSlop={DEFAULT_HIT_SLOP}
      >
        <Animated.View
          className={clsx('rounded-full', className)}
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            opacity: opacityAnim,
          }}
        />
      </Pressable>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t(`manageInsoles.${device.foot}`, { userName: user?.name })}
        message={`${t(`manageInsoles.connectionStatus.${connectionType}`)}${
          device.batteryLevel === LOW_BATTERY_LEVEL
            ? `\n\n${t(`manageInsoles.chargeDevice`)}`
            : ''
        }`}
      />
    </>
  );
};

export default BLEConnectionIndicator;
