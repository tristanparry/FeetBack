import MetricToggle from '@/components/History/MetricToggle';
import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { MetricData } from '@/utils/Home/metrics';
import MetricChart from '@/components/History/MetricChart';
import { useAuth } from '@/contexts/Auth';
import TimeRangeSelector from '@/components/History/TimeRangeSelector';
import DateNavigator from '@/components/History/DateNavigator';
import { getDateAndTime } from '@/utils/UI/dates';
import { TimeRange } from '@/types/dates';
import CustomScrollView from '@/components/UI/CustomScrollView';
import { BottomGradient } from '@/components/UI/Gradients';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { useBLE } from '@/contexts/BLE';
import { extractMetricSeries, fetchHistoryData } from '@/utils/History/metrics';
import { HistoryDataPoint } from '@/types/history';
import { DAYS_PER_WEEK } from '@/constants/dates';
import { DEFAULT_TEMP_UNIT } from '@/constants/temperature';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import clsx from 'clsx';
import { partition } from 'lodash';
import { LEFT_FOOT_KEY } from '@/constants/ble';
import { PairedDeviceSerials, Metric } from '@/types/metrics';

const History = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const { pairedDevices } = useBLE();
  const [pairedDeviceSerials, setPairedDeviceSerials] =
    useState<PairedDeviceSerials | null>(null);
  const [isHistoryDataLoading, setIsHistoryDataLoading] =
    useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Day);
  const [metricType, setMetricType] = useState<Metric>(Metric.Pressure);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { displayTitle, displayDescription } = useMemo(() => {
    const desc = MetricData[metricType].description(
      metricType === Metric.Temperature ? user?.temp_unit : undefined,
    );
    return {
      displayTitle: t(MetricData[metricType].label),
      displayDescription:
        metricType === Metric.Alignment
          ? desc.split('.').filter(Boolean).slice(0, -1).join('.') + '.'
          : desc,
    };
  }, [metricType, user?.temp_unit]);
  const [rawData, setRawData] = useState<HistoryDataPoint[]>([]);

  useEffect(() => {
    const [leftInsole, rightInsole] = partition(
      pairedDevices,
      (d) => d.foot === LEFT_FOOT_KEY,
    );
    const newSerials =
      leftInsole[0]?.serial && rightInsole[0]?.serial
        ? {
            leftSerial: leftInsole[0].serial,
            rightSerial: rightInsole[0].serial,
          }
        : null;

    setPairedDeviceSerials((prev) => {
      if (
        (prev === null && newSerials === null) ||
        (prev &&
          newSerials &&
          prev.leftSerial === newSerials.leftSerial &&
          prev.rightSerial === newSerials.rightSerial)
      ) {
        return prev;
      }
      return newSerials;
    });
  }, [pairedDevices]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, [timeRange]);

  useEffect(() => {
    if (!pairedDeviceSerials) return;
    const { date, year, month } = getDateAndTime(selectedDate);
    const fetchHistory = async () => {
      setIsHistoryDataLoading(true);
      try {
        const data = await fetchHistoryData(
          pairedDeviceSerials,
          timeRange,
          date,
          year,
          month,
          user?.temp_unit ?? DEFAULT_TEMP_UNIT,
        );
        setRawData(data ?? []);
      } catch (error) {
        console.error('Failed to fetch history data:', error);
      } finally {
        setIsHistoryDataLoading(false);
      }
    };
    fetchHistory();
  }, [timeRange, pairedDeviceSerials, selectedDate, user?.temp_unit]);

  const metricSeries = useMemo(
    () => extractMetricSeries(rawData, metricType),
    [rawData, metricType],
  );

  const canGoNext = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(selectedDate);
    switch (timeRange) {
      case TimeRange.Day:
        checkDate.setDate(checkDate.getDate() + 1);
        break;
      case TimeRange.Week:
        checkDate.setDate(checkDate.getDate() + DAYS_PER_WEEK);
        break;
      case TimeRange.Month:
        checkDate.setMonth(checkDate.getMonth() + 1);
        break;
    }
    checkDate.setHours(0, 0, 0, 0);
    return checkDate <= today;
  }, [selectedDate, timeRange]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    switch (timeRange) {
      case TimeRange.Day:
        newDate.setDate(newDate.getDate() - 1);
        break;
      case TimeRange.Week:
        newDate.setDate(newDate.getDate() - DAYS_PER_WEEK);
        break;
      case TimeRange.Month:
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDate = new Date(selectedDate);
    switch (timeRange) {
      case TimeRange.Day:
        newDate.setDate(newDate.getDate() + 1);
        break;
      case TimeRange.Week:
        newDate.setDate(newDate.getDate() + DAYS_PER_WEEK);
        break;
      case TimeRange.Month:
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    newDate.setHours(0, 0, 0, 0);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  return (
    <View className="flex-1 bg-primary-background px-4">
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <DateNavigator
        date={selectedDate}
        timeRange={timeRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoNext={canGoNext}
      />
      <CustomScrollView className="mt-4 flex-1 px-2">
        <View className={clsx(isHistoryDataLoading ? 'my-16' : 'my-4')}>
          {isHistoryDataLoading ? (
            <ActivityIndicator size="large" color={colors.primaryText} />
          ) : (
            <MetricChart
              metricType={metricType}
              data={metricSeries}
              timeRange={timeRange}
              selectedDate={selectedDate}
            />
          )}
        </View>
        <View className="px-12">
          <MetricToggle value={metricType} onChange={setMetricType} />
        </View>
        <FadeAnimation>
          <Text className="my-2 text-lg font-medium text-primary-text">
            {displayTitle}
          </Text>
          <Text className="text-md mb-4 font-light text-secondary-text">
            {displayDescription}
          </Text>
        </FadeAnimation>
      </CustomScrollView>
      <BottomGradient />
    </View>
  );
};

export default History;
