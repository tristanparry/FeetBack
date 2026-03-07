import { Animated, Easing } from 'react-native';
import { PropsWithChildren, useEffect, useRef } from 'react';

type FadeAnimationProps = PropsWithChildren & {
  axis?: 'vertical' | 'horizontal';
  amount?: number;
  duration?: number;
  transparency?: boolean;
  children?: React.ReactNode;
  className?: string;
};
const FadeAnimation = ({
  axis = 'vertical',
  amount = 10,
  duration = 500,
  transparency = true,
  children,
  className,
}: FadeAnimationProps) => {
  const opacity = useRef(new Animated.Value(transparency ? 0 : 1)).current;
  const translate = useRef(new Animated.Value(amount)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    Animated.timing(translate, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [
          axis === 'vertical'
            ? { translateY: translate }
            : { translateX: translate },
        ],
      }}
      className={className}
    >
      {children}
    </Animated.View>
  );
};

export default FadeAnimation;
