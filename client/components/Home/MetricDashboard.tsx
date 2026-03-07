import { View, Text } from 'react-native';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { DeviceInfo } from '@/types/ble';
import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import { MetricData, NO_METRIC_DATA } from '@/utils/Home/metrics';
import FootMetricCard from '@/components/Home/FootMetricCard';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { ModalState } from '@/types/ui';
import { useHealth } from '@/contexts/Health';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { extractTimeFromUTCString, getFormattedDate } from '@/utils/UI/dates';
import { useBLE } from '@/contexts/BLE';
import { useAuth } from '@/contexts/Auth';
import { AppRoutes } from '@/constants/app';
import { FootReading, Metric } from '@/types/metrics';

type MetricDashboardProps = {
  footReading: FootReading;
  handleMetricCardData: (data: ModalState) => void;
  className?: string;
};

const MetricDashboard = ({
  footReading,
  handleMetricCardData,
  className,
}: MetricDashboardProps) => {
  const currentDate = new Date();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isLoadingHealthInsights, numHealthInsights } = useHealth();
  const { pairedDevices } = useBLE();
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);

  useEffect(() => {
    setConnectedDevices(pairedDevices.filter((device) => device.isConnected));
  }, [pairedDevices]);

  return (
    <>
      <View className="flex flex-row items-center justify-between">
        <Text className="my-4 text-lg font-medium text-primary-text">
          {t('home.metrics.title')}
        </Text>
        <View className="flex items-end">
          <Text className="text-sm text-primary-accent">
            {getFormattedDate(currentDate, true)}
          </Text>
          {connectedDevices.length > 0 && (
            <Text className="text-xs italic text-secondary-accent">
              {extractTimeFromUTCString(
                footReading[LEFT_FOOT_KEY]?.timestamp ??
                  footReading[RIGHT_FOOT_KEY]?.timestamp ??
                  currentDate.toISOString(),
              )}
            </Text>
          )}
        </View>
      </View>
      <View className={clsx('mb-2', className)}>
        {(() => {
          const allCards = [
            ...Object.entries(MetricData).map(
              ([key, { label, description, iconName, computationMethod }]) => ({
                key,
                label,
                description: description(
                  key === Metric.Temperature ? user?.temp_unit : undefined,
                ),
                iconName,
                computationMethod,
                value: computationMethod(
                  connectedDevices,
                  footReading,
                  key === Metric.Temperature ? user?.temp_unit : undefined,
                ),
                isHealthCard: false,
              }),
            ),
            {
              key: 'healthInsights',
              label: 'home.metrics.healthInsights.name',
              description: undefined,
              iconName: 'fitness-outline',
              value: `${numHealthInsights > 0 ? numHealthInsights : NO_METRIC_DATA}`,
              isHealthCard: true,
            },
          ];

          const rows: Array<Array<(typeof allCards)[number]>> = [];
          for (let i = 0; i < allCards.length; i += 2) {
            rows.push(allCards.slice(i, i + 2));
          }

          return rows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              className="mb-2 flex-row justify-between"
            >
              {row.map((card) => (
                <FootMetricCard
                  key={card.key}
                  metric={{
                    name: t(card.label),
                    description: !card.isHealthCard
                      ? card.description
                      : undefined,
                    value: card.value,
                  }}
                  iconName={card.iconName}
                  retrieveModalData={
                    card.isHealthCard ? undefined : handleMetricCardData
                  }
                  customIcon={
                    card.isHealthCard ? (
                      <SmallActionButton
                        iconName="arrow-forward-circle-outline"
                        iconSize={16}
                        onPress={() => router.push(AppRoutes.Health)}
                        iconClassName="text-secondary-text -rotate-45"
                      />
                    ) : undefined
                  }
                  isLoading={card.isHealthCard && isLoadingHealthInsights}
                />
              ))}
            </View>
          ));
        })()}
      </View>
    </>
  );
};

export default MetricDashboard;
