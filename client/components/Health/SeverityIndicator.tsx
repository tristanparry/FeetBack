import { View } from 'react-native';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import clsx from 'clsx';
import { SeverityLevel } from '@/types/health';

type SeverityIndicatorProps = {
  severity: SeverityLevel;
  size?: number;
  className?: string;
};

const SeverityIndicator = ({
  severity,
  size = 10,
  className,
}: SeverityIndicatorProps) => {
  const { theme } = useTheme();
  const colors = jsColors[theme];

  if (severity === SeverityLevel.Severe) {
    return (
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors.error,
        }}
        className={className}
      />
    );
  }

  if (severity === SeverityLevel.Mild) {
    return (
      <View
        className={clsx('bg-warning', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <View
      className={clsx('rounded-full bg-success', className)}
      style={{ width: size, height: size }}
    />
  );
};

export default SeverityIndicator;
