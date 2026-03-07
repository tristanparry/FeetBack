import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import HealthInsightCard from '@/components/Health/HealthInsightCard';
import HealthOverviewCard from '@/components/Health/HealthOverviewCard';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import CustomScrollView from '@/components/UI/CustomScrollView';
import { BottomGradient } from '@/components/UI/Gradients';
import { useHealth } from '@/contexts/Health';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/core';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';

const Health = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const isFocused = useIsFocused();
  const { healthInsights, isLoadingHealthInsights, fetchHealthInsights } =
    useHealth();

  useEffect(() => {
    if (isFocused) {
      fetchHealthInsights();
    }
  }, [isFocused, fetchHealthInsights]);

  return (
    <View className="flex-1 bg-primary-background">
      <FadeAnimation transparency={false} axis="horizontal" amount={-5}>
        <View className="px-4">
          <HealthOverviewCard healthInsights={healthInsights} />
        </View>
      </FadeAnimation>
      <CustomScrollView
        title={t('health.insights.title')}
        items={healthInsights}
        noItemsText={t('health.insights.noInsights')}
        renderItem={(insight) => <HealthInsightCard insight={insight} />}
        className="flex-1 bg-primary-background px-4"
        onRefresh={fetchHealthInsights}
      >
        {isLoadingHealthInsights && (
          <ActivityIndicator size="large" color={colors.primaryText} />
        )}
      </CustomScrollView>
      <BottomGradient />
    </View>
  );
};

export default Health;
