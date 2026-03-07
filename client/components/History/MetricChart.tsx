import { type FootReading, Metric } from '@/types/metrics';
import FootHeatmap from '@/components/Home/FootHeatmap';
import LineGraph from '@/components/History/LineGraph';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { TimeRange } from '@/types/dates';
import { HistoryDataArray } from '@/types/history';
import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import {
  hasValidGraphData,
  hasValidPressureData,
} from '@/utils/History/metrics';

type MetricChartProps = {
  metricType: Metric;
  data: FootReading[] | HistoryDataArray[];
  timeRange: TimeRange;
  selectedDate?: Date;
};

const MetricChart = ({
  metricType,
  data,
  timeRange,
  selectedDate,
}: MetricChartProps) => {
  const { t } = useTranslation();

  if (
    (metricType === Metric.Pressure &&
      !hasValidPressureData(data as FootReading[])) ||
    ((metricType === Metric.Temperature || metricType === Metric.Alignment) &&
      !hasValidGraphData(data as HistoryDataArray[]))
  ) {
    return (
      <FadeAnimation className="my-16 flex items-center">
        <Text className="text-secondary-text">{t('history.data.noData')}</Text>
      </FadeAnimation>
    );
  }

  switch (metricType) {
    case Metric.Pressure:
      const pressureData = data as FootReading[];
      let latestPressure: FootReading = {};
      for (let i = pressureData.length - 1; i >= 0; i--) {
        const pressure = pressureData[i];
        if (pressure && (pressure[LEFT_FOOT_KEY] || pressure[RIGHT_FOOT_KEY])) {
          latestPressure = pressure;
          break;
        }
      }
      return <FootHeatmap reading={latestPressure} scale={0.7} />;
    case Metric.Alignment:
      return (
        <LineGraph
          data={data as HistoryDataArray[]}
          metricType={metricType}
          timeRange={timeRange}
          selectedDate={selectedDate}
        />
      );
    case Metric.Temperature:
      return (
        <LineGraph
          data={data as HistoryDataArray[]}
          metricType={metricType}
          timeRange={timeRange}
          selectedDate={selectedDate}
        />
      );
  }
};

export default MetricChart;
