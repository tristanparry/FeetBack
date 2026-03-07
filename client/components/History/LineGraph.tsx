import { jsColors } from '@/constants/themes';
import { LineChart } from 'react-native-gifted-charts';
import { Theme, useTheme } from '@/contexts/Theme';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import {
  convertHourToString,
  getFormattedWeekday,
  getDaysInMonth,
} from '@/utils/UI/dates';
import { HourlyDataPoint, HistoryDataArray } from '@/types/history';
import { DAYS_PER_WEEK, HOURS_PER_DAY } from '@/constants/dates';
import { useAuth } from '@/contexts/Auth';
import { DEFAULT_TEMP_UNIT, TEMP_UNIT_SYMBOLS } from '@/constants/temperature';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useCallback } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import {
  formatDateToYYYYMMDD,
  getWeekDatesAsDates,
  getMonthDatesAsDates,
} from '@/utils/UI/dates';
import {
  flattenDailyDataPoints,
  createDailyDataMap,
  createHourlyDataMap,
} from '@/utils/History/lineGraph';
import { Metric } from '@/types/metrics';
import { sanitizeValue } from '@/utils/History/metrics';
import { TimeRange } from '@/types/dates';

const NO_X_SECTIONS = 4;
const NO_Y_SECTIONS = 4;
const STROKE_WIDTH = 1.5;
const DATA_POINT_RADIUS = 2.5;
const LABEL_FONT_SIZE = 10;
const HORIZONTAL_PADDING = 100;

type LineGraphProps = {
  data: HistoryDataArray[] | null | undefined;
  metricType: Metric;
  timeRange: TimeRange;
  selectedDate?: Date;
};

const LineGraph = ({
  data,
  metricType,
  timeRange,
  selectedDate,
}: LineGraphProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const isDaily = timeRange === TimeRange.Day;
  const isWeekly = timeRange === TimeRange.Week;
  const isMonthly = timeRange === TimeRange.Month;
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  }, []);

  const yAxisUnit = useMemo(() => {
    switch (metricType) {
      case Metric.Alignment:
        return '°';
      case Metric.Temperature:
        return t(TEMP_UNIT_SYMBOLS[user?.temp_unit ?? DEFAULT_TEMP_UNIT]);
      default:
        return '';
    }
  }, [metricType, user?.temp_unit, t]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const actuals: Array<number | null> = [];
    if (isDaily) {
      const hourlyData = data?.[0] as HourlyDataPoint[] | undefined;
      const dataMap = createHourlyDataMap(hourlyData);
      for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
        const raw = dataMap.get(hour);
        actuals.push(sanitizeValue(metricType, raw));
        labels.push(
          hour % NO_X_SECTIONS === 0 ? convertHourToString(hour) : '',
        );
      }
    } else {
      const allDailyPoints = flattenDailyDataPoints(data);
      const baseDate = selectedDate || new Date();
      const hasData = allDailyPoints.length > 0;
      const dataMap = hasData ? createDailyDataMap(allDailyPoints) : null;
      if (isWeekly) {
        const weekDates = getWeekDatesAsDates(baseDate);
        weekDates.forEach((date) => {
          const dateStr = formatDateToYYYYMMDD(date);
          const raw = dataMap?.get(dateStr);
          actuals.push(sanitizeValue(metricType, raw));
          labels.push(getFormattedWeekday(date, true));
        });
      } else {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth() + 1;
        const monthDates = getMonthDatesAsDates(year, month);
        monthDates.forEach((date) => {
          const dateStr = formatDateToYYYYMMDD(date);
          const day = date.getDate();
          const raw = dataMap?.get(dateStr);
          actuals.push(sanitizeValue(metricType, raw));
          labels.push(day % DAYS_PER_WEEK === 0 ? `${month}/${day}` : '');
        });
      }
    }
    return actuals.map((v, i) => ({
      value: v ?? 0,
      label: labels[i] ?? '',
      hideDataPoint: v == null,
    }));
  }, [data, selectedDate, isDaily, isWeekly, isMonthly, metricType]);

  const xAxisLabelWidth = useMemo(() => {
    if (isDaily) {
      return Math.ceil((HORIZONTAL_PADDING / NO_X_SECTIONS) * 1.1);
    } else if (isMonthly) {
      return Math.ceil((HORIZONTAL_PADDING / NO_X_SECTIONS) * 1.1);
    } else {
      return Math.ceil((HORIZONTAL_PADDING / DAYS_PER_WEEK) * 2.5);
    }
  }, [isDaily, isWeekly, isMonthly]);

  const spacing = useMemo(() => {
    if (containerWidth === 0) {
      return isDaily ? 10 : 25;
    }
    const availableWidth = containerWidth - HORIZONTAL_PADDING;
    let numberOfDataPoints: number;
    if (isDaily) {
      numberOfDataPoints = HOURS_PER_DAY;
    } else if (isWeekly) {
      numberOfDataPoints = DAYS_PER_WEEK;
    } else {
      const baseDate = selectedDate || new Date();
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth() + 1;
      numberOfDataPoints = getDaysInMonth(year, month);
    }
    if (numberOfDataPoints <= 1) {
      return 0;
    }
    return availableWidth / (numberOfDataPoints - 1);
  }, [containerWidth, isDaily, isWeekly, isMonthly, selectedDate]);

  return (
    <FadeAnimation axis="horizontal" amount={5}>
      <View onLayout={handleLayout}>
        <LineChart
          data={chartData}
          noOfSections={NO_Y_SECTIONS}
          spacing={spacing}
          thickness={STROKE_WIDTH}
          dataPointsRadius={DATA_POINT_RADIUS}
          color={colors.primaryAccent}
          hideDataPoints={false}
          dataPointsColor={colors.primaryAccent}
          xAxisLabelTextStyle={{
            color: colors.secondaryText,
            fontSize: LABEL_FONT_SIZE,
            width: xAxisLabelWidth,
          }}
          yAxisLabelSuffix={yAxisUnit}
          yAxisTextStyle={{
            color: colors.secondaryText,
            fontSize: LABEL_FONT_SIZE,
          }}
          xAxisColor={colors.primaryText}
          yAxisColor={colors.primaryText}
          startFillColor={colors.primaryAccent}
          endFillColor={colors.secondaryAccent}
          startOpacity={theme === Theme.Light ? 0.35 : 0.65}
          endOpacity={0}
          areaChart
          curved
        />
      </View>
    </FadeAnimation>
  );
};

export default LineGraph;
