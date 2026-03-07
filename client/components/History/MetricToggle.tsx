import { MetricData } from '@/utils/Home/metrics';
import { Metric } from '@/types/metrics';
import { View } from 'react-native';
import clsx from 'clsx';
import Button from '@/components/UI/Button';
import FadeAnimation from '@/utils/UI/FadeAnimation';

type MetricToggleProps = {
  value: Metric;
  onChange: (value: Metric) => void;
  className?: string;
};

const MetricToggle = ({ value, onChange, className }: MetricToggleProps) => {
  return (
    <View className={clsx('flex-row', className)}>
      {Object.entries(Metric).map(([key, metric], index) => (
        <FadeAnimation
          key={key}
          amount={10 + index * 5}
          duration={500 + index * 100}
          className="mx-1 flex-1"
        >
          <Button
            onPress={() => onChange(metric)}
            iconName={MetricData[metric].iconName}
            iconSize={24}
            className="justify-center py-[5px]"
            secondaryButtonStyle={value === metric}
          />
        </FadeAnimation>
      ))}
    </View>
  );
};

export default MetricToggle;
