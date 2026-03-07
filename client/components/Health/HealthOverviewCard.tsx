import { Text, View, Animated, Platform } from 'react-native';
import clsx from 'clsx';
import { useRef, useEffect, useState, useMemo } from 'react';
import { SeverityLevel, HealthInsight } from '@/types/health';
import { HEALTH_INSIGHTS_TIME_THRESHOLD } from '@/constants/health';
import SeverityIndicator from '@/components/Health/SeverityIndicator';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import LinearGradient from 'react-native-linear-gradient';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import { useTranslation } from 'react-i18next';
import { lowerCase } from 'lodash';
import AlertModal from '@/components/UI/AlertModal';
import SmallActionButton from '@/components/UI/SmallActionButton';

type HealthOverviewCardProps = {
  healthInsights?: HealthInsight[];
  className?: string;
};

const HealthOverviewCard = ({
  healthInsights,
  className,
}: HealthOverviewCardProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const { numsInsights, highestSeverity } = useMemo(() => {
    const highestSeverity =
      healthInsights?.[0]?.severity ?? SeverityLevel.Neutral;
    const initObj = Object.values(SeverityLevel).reduce(
      (obj, level) => ({ ...obj, [level]: 0 }),
      {} as Record<SeverityLevel, number>,
    );
    return {
      numsInsights:
        healthInsights?.reduce((acc, { severity }) => {
          acc[severity] += 1;
          return acc;
        }, initObj) || initObj,
      highestSeverity,
    };
  }, [healthInsights]);

  useEffect(() => {
    const count = healthInsights?.length ?? 0;

    if (count < 2) {
      animatedValue.setValue(count);
      setDisplayValue(count);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: count,
      duration: 600,
      useNativeDriver: false,
    }).start();
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [healthInsights]);

  return (
    <>
      <View
        className={clsx(
          'flex w-full justify-between overflow-hidden rounded-xl border border-tertiary-background bg-primary-background px-6 pb-4 shadow-2xl',
          className,
        )}
      >
        <View className="mb-2 mt-3 flex-row items-center gap-2">
          <Text className="text-lg font-medium text-primary-text">
            {t('health.overview.title')}
          </Text>
          <SmallActionButton
            iconName="information-circle-outline"
            iconSize={14}
            iconClassName="text-secondary-text"
            onPress={() => setShowAlert(true)}
          />
        </View>
        <View className="flex-row self-center">
          <LinearGradient
            colors={colors.gradients[highestSeverity]}
            start={{ x: 0.8, y: 1 }}
            end={{ x: 0.1, y: 0 }}
            style={
              Platform.OS === 'ios'
                ? {
                    width: '40%',
                    aspectRatio: 1,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor:
                      highestSeverity === SeverityLevel.Neutral
                        ? colors.success
                        : highestSeverity === SeverityLevel.Mild
                          ? colors.warning
                          : colors.error,
                  }
                : {
                    borderRadius: 999,
                  }
            }
            className={clsx(
              'items-center justify-center rounded-full border-2',
              Platform.OS === 'android' && 'aspect-square w-40',
              highestSeverity === SeverityLevel.Neutral &&
                'border-success bg-success-soft',
              highestSeverity === SeverityLevel.Mild &&
                'border-warning bg-warning-soft',
              highestSeverity === SeverityLevel.Severe &&
                'border-error bg-error-soft',
            )}
          >
            <Text
              style={{
                textShadowColor: colors.tertiaryBackground,
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 4,
              }}
              className={clsx(
                'text-6xl font-black',
                highestSeverity === SeverityLevel.Neutral && 'text-success',
                highestSeverity === SeverityLevel.Mild && 'text-warning',
                highestSeverity === SeverityLevel.Severe && 'text-error',
              )}
            >
              {displayValue}
            </Text>
            <Text
              style={{
                textShadowColor: colors.tertiaryBackground,
                textShadowOffset: { width: 0.5, height: 0.5 },
                textShadowRadius: 4,
              }}
              className={clsx(
                'text-md font-bold italic',
                highestSeverity === SeverityLevel.Neutral && 'text-success',
                highestSeverity === SeverityLevel.Mild && 'text-warning',
                highestSeverity === SeverityLevel.Severe && 'text-error',
              )}
            >
              {healthInsights?.length === 1
                ? t('health.overview.oneInsight')
                : t('health.overview.multipleInsights')}
            </Text>
          </LinearGradient>
          {healthInsights && healthInsights.length > 0 && (
            <View className="ml-4 flex-1 items-center justify-center">
              <View>
                {Object.entries(numsInsights ?? [])
                  .filter(([_, count]) => count > 0)
                  .map(([severity, count], index) => {
                    return (
                      <FadeAnimation
                        key={`${severity}-${count}`}
                        axis="horizontal"
                        amount={10 + index * 10}
                        duration={500 + index * 100}
                      >
                        <View className="flex flex-row items-center">
                          <SeverityIndicator
                            severity={severity as SeverityLevel}
                            className="mr-2"
                          />
                          <Text className="text-lg italic text-secondary-text">
                            {count}{' '}
                          </Text>
                          <Text className="text-lg italic text-secondary-text">
                            {lowerCase(t(`health.severity.${severity}`))}
                          </Text>
                        </View>
                      </FadeAnimation>
                    );
                  })}
              </View>
            </View>
          )}
        </View>
      </View>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('health.overview.notice.title')}
        message={t('health.overview.notice.description', {
          threshold: HEALTH_INSIGHTS_TIME_THRESHOLD,
        })}
      />
    </>
  );
};

export default HealthOverviewCard;
