import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import clsx from 'clsx';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { PropsWithChildren } from 'react';
import { IconLibrary, ModalState } from '@/types/ui';
import FadeAnimation from '@/utils/UI/FadeAnimation';

type FootMetric = {
  name: string;
  value: string;
  description?: string;
};

type FootMetricCardProps = PropsWithChildren & {
  metric: FootMetric;
  isLoading?: boolean;
  iconName?: string;
  iconSize?: number;
  iconClassName?: string;
  iconLibrary?: IconLibrary;
  customIcon?: React.ReactNode;
  retrieveModalData?: (data: ModalState) => void;
  className?: string;
};

const FootMetricCard = ({
  metric,
  isLoading = false,
  iconName,
  iconSize = 24,
  iconClassName,
  iconLibrary = 'ionicons',
  customIcon,
  retrieveModalData,
  className,
}: FootMetricCardProps) => {
  const { theme } = useTheme();
  const colors = jsColors[theme];

  const IconComponent = (() => {
    if (!iconName) return null;
    switch (iconLibrary) {
      case 'ionicons':
        return (
          <Ionicons
            name={iconName as any}
            size={iconSize}
            className={clsx('mr-2 text-primary-accent', iconClassName)}
          />
        );
      case 'materialcommunity':
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={iconSize}
            color={colors.primaryAccent}
            className={clsx('mr-2', iconClassName)}
          />
        );
      case 'entypo':
        return (
          <Entypo
            name={iconName as any}
            size={iconSize}
            color={colors.primaryAccent}
            className={clsx('mr-2', iconClassName)}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <FadeAnimation transparency={false} className="flex-1">
      <View
        style={{
          borderRadius: 8,
          overflow: 'hidden',
          shadowColor: 'hsl(0, 0, 0%)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        className={clsx('mx-1 flex-1 bg-secondary-background p-4', className)}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="mr-2 text-sm italic text-primary-text">
            {metric.name}
          </Text>
          <View className="flex-row">
            {metric.description && (
              <SmallActionButton
                iconName="information-circle-outline"
                iconSize={16}
                iconClassName="text-secondary-text"
                onPress={() =>
                  retrieveModalData?.({
                    title: metric.name ?? '',
                    textContent: metric.description ?? '',
                    isVisible: true,
                  })
                }
              />
            )}
            {customIcon}
          </View>
        </View>
        <View className="flex-row items-center justify-start">
          <FadeAnimation axis="horizontal" amount={5}>
            {IconComponent}
          </FadeAnimation>
          <FadeAnimation axis="horizontal" amount={-5}>
            <Text className="text-xl font-bold text-primary-text">
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                metric.value
              )}
            </Text>
          </FadeAnimation>
        </View>
      </View>
    </FadeAnimation>
  );
};

export default FootMetricCard;
