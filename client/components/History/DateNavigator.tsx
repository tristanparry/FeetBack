import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import {
  getFormattedDayLabel,
  getFormattedMonthLabel,
  getFormattedWeekLabel,
} from '@/utils/UI/dates';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import SmallActionButton from '@/components/UI/SmallActionButton';
import AlertModal from '@/components/UI/AlertModal';
import { useTranslation } from 'react-i18next';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';
import { TimeRange } from '@/types/dates';

type DateNavigatorProps = {
  date: Date;
  timeRange: TimeRange;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext?: boolean;
  className?: string;
};

const DateNavigator = ({
  date,
  timeRange,
  onPrevious,
  onNext,
  canGoNext = false,
  className,
}: DateNavigatorProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const timeRangeLabel = useMemo(() => {
    if (!date) return null;
    switch (timeRange) {
      case TimeRange.Day:
        return getFormattedDayLabel(date);
      case TimeRange.Week:
        return getFormattedWeekLabel(date);
      case TimeRange.Month:
        return getFormattedMonthLabel(date);
    }
  }, [date, timeRange]);

  return (
    <>
      <View
        className={clsx(
          'flex-row items-center justify-between py-2',
          className,
        )}
      >
        <Pressable
          onPress={onPrevious}
          hitSlop={DEFAULT_HIT_SLOP}
          className="p-2 active:opacity-50"
        >
          <FadeAnimation axis="horizontal" amount={-5}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.secondaryText}
            />
          </FadeAnimation>
        </Pressable>
        <View className="flex-1 items-center px-4">
          <FadeAnimation className="flex-col items-center gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-center text-base font-medium text-primary-text">
                {timeRangeLabel ?? ''}
              </Text>
              <SmallActionButton
                iconName="information-circle-outline"
                iconSize={14}
                iconClassName="text-secondary-text"
                onPress={() => setShowAlert(true)}
              />
            </View>
          </FadeAnimation>
        </View>
        <Pressable
          onPress={onNext}
          disabled={!canGoNext}
          hitSlop={DEFAULT_HIT_SLOP}
          className="p-2 active:opacity-50"
        >
          <FadeAnimation axis="horizontal" amount={5}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                canGoNext ? colors.secondaryText : colors.tertiaryBackground
              }
            />
          </FadeAnimation>
        </Pressable>
      </View>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('history.dateNavigator.notice.title')}
        message={t('history.dateNavigator.notice.description')}
      />
    </>
  );
};

export default DateNavigator;
