import { DeviceInfo } from '@/types/ble';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SensorReading } from '@/types/sensors';
import { SensorReadingEmitter } from '@/utils/Sensors/SensorReadingEmitter';
import FootHeatmap from '@/components/Home/FootHeatmap';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { useRouter } from 'expo-router';
import CustomScrollView from '@/components/UI/CustomScrollView';
import { BottomGradient } from '@/components/UI/Gradients';
import BottomModal from '@/components/UI/BottomModal';
import { ModalState } from '@/types/ui';
import DevicesPanel from '@/components/Home/DevicesPanel';
import { useTranslation } from 'react-i18next';
import type { FootReading } from '@/types/metrics';
import MetricDashboard from '@/components/Home/MetricDashboard';
import { AppRoutes } from '@/constants/app';
import { useIsFocused } from '@react-navigation/core';
import { useHealth } from '@/contexts/Health';
import { sensorBenchmarks } from '@/utils/Sensors/Benchmarks';

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { fetchHealthInsights } = useHealth();
  const [footReading, setFootReading] = useState<FootReading>({});
  const [modalState, setModalState] = useState<ModalState>({
    title: '',
    textContent: '',
    isVisible: false,
  });

  const handleMetricCardData = (data: ModalState) => {
    setModalState(data);
  };

  useEffect(() => {
    if (isFocused) {
      fetchHealthInsights();
    }
  }, [isFocused, fetchHealthInsights]);

  useEffect(() => {
    const handler = ({
      device,
      reading,
    }: {
      device: DeviceInfo;
      reading: SensorReading;
    }) => {
      sensorBenchmarks.recordReading(device, reading);
      setFootReading((prev) => {
        if (
          JSON.stringify(prev[device.foot as keyof FootReading]) ===
          JSON.stringify(reading)
        )
          return prev;
        return {
          ...prev,
          [device.foot]: reading,
        };
      });
    };

    const disconnectHandler = ({ device }: { device: DeviceInfo }) =>
      setFootReading((prev) => {
        const updated = { ...prev };
        delete updated[device.foot as keyof FootReading];
        return updated;
      });

    SensorReadingEmitter.onReading(handler);
    SensorReadingEmitter.onDisconnect(disconnectHandler);

    return () => {
      SensorReadingEmitter.removeReadingListener(handler);
      SensorReadingEmitter.removeDisconnectListener(disconnectHandler);
    };
  }, []);

  return (
    <View className="flex-1 bg-primary-background">
      <FootHeatmap reading={footReading} />
      <CustomScrollView className="flex-1 bg-primary-background px-4">
        <MetricDashboard
          footReading={footReading}
          handleMetricCardData={handleMetricCardData}
        />
        <View className="flex flex-row items-center justify-between">
          <Text className="my-4 text-lg font-medium text-primary-text">
            {t('home.insoles.title')}
          </Text>
          <SmallActionButton
            iconName="footsteps-outline"
            iconSize={18}
            iconClassName="text-primary-accent"
            className="p-2"
            onPress={() => router.push(AppRoutes.ManageInsoles)}
          />
        </View>
        <DevicesPanel />
      </CustomScrollView>
      <BottomGradient />
      <BottomModal
        title={modalState.title}
        textContent={modalState.textContent}
        isVisible={modalState.isVisible}
        onClose={() => setModalState({ ...modalState, isVisible: false })}
      />
    </View>
  );
};

export default Index;
