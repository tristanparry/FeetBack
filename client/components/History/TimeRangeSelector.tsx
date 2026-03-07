import { Pressable, Text, View } from 'react-native';
import clsx from 'clsx';
import { TimeRange } from '@/types/dates';
import { startCase } from 'lodash';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

type TimeRangeSelectorProps = {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
};

const TimeRangeSelector = ({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) => {
  return (
    <View className={clsx('flex-row', className)}>
      {Object.entries(TimeRange).map(([key, timeRange], index) => (
        <FadeAnimation key={key} amount={5 + index * 5} className="flex-1 ">
          <Pressable
            onPress={() => onChange(timeRange)}
            hitSlop={DEFAULT_HIT_SLOP}
            className={clsx(
              'items-center py-2',
              value === timeRange && 'border-b-2 border-primary-accent',
            )}
          >
            <Text
              className={
                value === timeRange
                  ? 'text-md font-medium text-primary-accent'
                  : 'text-md font-normal text-secondary-text'
              }
            >
              {startCase(timeRange)}
            </Text>
          </Pressable>
        </FadeAnimation>
      ))}
    </View>
  );
};

export default TimeRangeSelector;
