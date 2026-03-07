import { MaterialIcons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Pressable } from 'react-native';
import { useBLE } from '@/contexts/BLE';
import { ConnectionState } from '@/types/ble';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const BLEConnectButton = ({ className }: { className?: string }) => {
  const {
    pairedDevices,
    requestPermissions,
    findBLEs,
    disconnectAllBLEs,
    cancelBLEScan,
    connectionState,
    isScanning,
  } = useBLE();
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.8,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }
  }, [isScanning]);

  const handleConnectionChange = async () => {
    if (pairedDevices.filter((ble) => ble.isConnected).length > 0) {
      disconnectAllBLEs();
      return;
    }
    if (
      [ConnectionState.Scanning, ConnectionState.Connecting].includes(
        connectionState,
      )
    ) {
      cancelBLEScan();
      return;
    }
    const granted = await requestPermissions();
    if (granted) {
      await findBLEs();
    } else {
      console.warn('Bluetooth permissions not granted');
    }
  };

  const buttonColor = {
    [ConnectionState.Idle]: 'bg-error',
    [ConnectionState.Scanning]: 'bg-info',
    [ConnectionState.Connecting]: 'bg-info',
    [ConnectionState.ConnectedPartial]: 'bg-warning',
    [ConnectionState.ConnectedFull]: 'bg-success',
    [ConnectionState.Disconnecting]: 'bg-secondary-background',
    [ConnectionState.Error]: 'bg-error',
  }[connectionState];

  type IconNames =
    | 'bluetooth-disabled'
    | 'bluetooth-searching'
    | 'bluetooth-connected';

  const buttonIcon: Record<ConnectionState, IconNames> = {
    [ConnectionState.Idle]: 'bluetooth-disabled',
    [ConnectionState.Scanning]: 'bluetooth-searching',
    [ConnectionState.Connecting]: 'bluetooth-searching',
    [ConnectionState.ConnectedPartial]: 'bluetooth-connected',
    [ConnectionState.ConnectedFull]: 'bluetooth-connected',
    [ConnectionState.Disconnecting]: 'bluetooth-disabled',
    [ConnectionState.Error]: 'bluetooth-disabled',
  };

  return (
    <Animated.View
      style={[{ opacity: pulseAnimation }, styles.animatedWrapper]}
    >
      <Pressable
        onPress={handleConnectionChange}
        style={({ pressed }) => [pressed ? { opacity: 0.75 } : {}]}
        hitSlop={DEFAULT_HIT_SLOP}
        className={clsx(
          buttonColor,
          'items-center rounded px-3 py-2 active:opacity-75',
          className,
        )}
        disabled={connectionState === ConnectionState.Disconnecting}
      >
        <MaterialIcons
          name={buttonIcon[connectionState]}
          size={20}
          color="white"
        />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    alignSelf: 'flex-start',
  },
});

export default BLEConnectButton;
