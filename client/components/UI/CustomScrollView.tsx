import React, { useRef, useState, useEffect, PropsWithChildren } from 'react';
import { ScrollView, Animated, View, Text, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

const SCROLL_LIMIT = 200;

type CustomScrollViewProps<T> = PropsWithChildren & {
  title?: string;
  items?: T[];
  noItemsText?: string;
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
  onRefresh?: () => void | Promise<void>;
};

const CustomScrollView = <T,>({
  title = undefined,
  items = [],
  noItemsText,
  renderItem,
  className,
  children,
  onRefresh,
}: CustomScrollViewProps<T>) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const gradient = colors.gradients.primaryBackgroundTransparent;
  const tabBarHeight = useBottomTabBarHeight() + 20;
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showScrollViewGradient, setShowScrollViewGradient] =
    useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showScrollViewGradient ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showScrollViewGradient]);

  const handleScroll = (event: any) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > SCROLL_LIMIT);
    setShowScrollViewGradient(event.nativeEvent.contentOffset.y > 0);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const hasItems = items.length > 0 && renderItem;

  return (
    <>
      {title && (
        <View className="flex flex-row items-center justify-between px-4">
          <Text className="my-4 text-lg font-medium text-primary-text">
            {title}
          </Text>
          {showScrollTop && (
            <FadeAnimation axis="horizontal" amount={10} duration={200}>
              <SmallActionButton
                iconName="arrow-up-outline"
                iconSize={18}
                iconClassName="text-secondary-text"
                className="p-2"
                onPress={scrollToTop}
              />
            </FadeAnimation>
          )}
        </View>
      )}
      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          className={className}
          contentContainerStyle={{ paddingBottom: tabBarHeight }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                progressBackgroundColor={colors.primaryBackground}
                colors={[colors.primaryAccent]}
              />
            ) : undefined
          }
        >
          {hasItems
            ? items.map((item, index) => (
                <FadeAnimation
                  key={index}
                  transparency={false}
                  duration={200 * (index + 1)}
                >
                  {renderItem(item, index)}
                </FadeAnimation>
              ))
            : (children || (
                <View className="flex-1 items-center pt-8">
                  <Text className="my-2 text-lg font-light text-secondary-text">
                    {noItemsText ?? t('common.noItems')}
                  </Text>
                </View>
              ))}
        </ScrollView>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            opacity: fadeAnim,
          }}
        >
          <LinearGradient colors={gradient} style={{ flex: 1 }} />
        </Animated.View>
      </View>
    </>
  );
};

export default CustomScrollView;
