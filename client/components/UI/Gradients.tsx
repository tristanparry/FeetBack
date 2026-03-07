import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import LinearGradient from 'react-native-linear-gradient';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const TopGradient = () => {
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const gradient = colors.gradients.primaryBackgroundTransparent;
  const tabBarHeight = useBottomTabBarHeight() + 20;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      pointerEvents="none"
      style={{
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: tabBarHeight,
      }}
    />
  );
};

export const BottomGradient = () => {
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const gradient = colors.gradients.primaryBackgroundTransparent;
  const tabBarHeight = useBottomTabBarHeight() + 20;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      pointerEvents="none"
      style={{
        flex: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: tabBarHeight,
      }}
    />
  );
};
