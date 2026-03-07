import { PropsWithChildren, useRef, useState, useEffect } from 'react';
import {
  Modal,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import clsx from 'clsx';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { Theme, useTheme } from '@/contexts/Theme';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type BottomModalProps = PropsWithChildren & {
  title?: string;
  textContent?: string;
  isVisible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

const BottomModal = ({
  title,
  textContent,
  isVisible,
  onClose,
  children,
}: BottomModalProps) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [showModal, setShowModal] = useState<boolean>(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 50) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!showModal) return null;

  return (
    <Modal
      animationType="none"
      transparent
      visible={showModal}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor:
              theme === Theme.Light
                ? 'rgba(0,0,0,0.5)'
                : 'rgba(255,255,255,0.2)',
            opacity: fadeAnim,
          }}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateY }],
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }}
      >
        <Pressable
          onPress={() => {}}
          hitSlop={DEFAULT_HIT_SLOP}
          className="w-full rounded-tl-2xl rounded-tr-2xl bg-secondary-background shadow-xl"
        >
          <View
            className={clsx(
              'flex flex-row items-center border-b border-tertiary-background px-4 py-2',
              title ? 'justify-between' : 'justify-end',
            )}
          >
            {title && (
              <Text className="text-lg font-semibold text-primary-text">
                {title}
              </Text>
            )}
            <SmallActionButton iconName="close-outline" onPress={onClose} />
          </View>
          <View className="px-4 py-2 pb-[5em]">
            {textContent && (
              <Text className="text-md font-light text-secondary-text">
                {textContent}
              </Text>
            )}
            {children}
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default BottomModal;
