import { View, Text, Platform } from 'react-native';
import SeverityIndicator from '@/components/Health/SeverityIndicator';
import { HealthInsight } from '@/types/health';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import LinearGradient from 'react-native-linear-gradient';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type HealthInsightCardProps = {
  insight: HealthInsight;
  className?: string;
};

const HealthInsightCard = ({ insight, className }: HealthInsightCardProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { name, description, severity } = insight;
  const colors = jsColors[theme];
  const gradient = colors.gradients[severity];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0.8, y: 1 }}
      end={{ x: 0.7, y: 0 }}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: 'hsl(0, 0, 0%)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        ...(Platform.OS === 'ios' && { marginBottom: 12 }),
      }}
      className={clsx(
        'w-full p-4',
        Platform.OS === 'android' && 'mb-4',
        className,
      )}
    >
      <Text
        className={clsx(
          'text-xl font-semibold text-primary-text',
          Platform.OS === 'ios' && 'px-4 pt-4',
        )}
      >
        {name}
      </Text>
      <Text
        className={clsx(
          'text-md my-2 font-light text-secondary-text',
          Platform.OS === 'ios' && 'px-4',
        )}
      >
        {description}
      </Text>
      <View
        className={clsx(
          'flex flex-row items-center',
          Platform.OS === 'ios' && 'px-4 pb-4',
        )}
      >
        <SeverityIndicator severity={severity} className="mr-2" />
        <Text className="text-md font-semibold italic text-secondary-text">
          {t(`health.severity.${severity}`)}
        </Text>
      </View>
    </LinearGradient>
  );
};

export default HealthInsightCard;
