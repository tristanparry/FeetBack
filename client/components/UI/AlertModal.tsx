import {
  PropsWithChildren,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  Modal,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
} from 'react-native';
import clsx from 'clsx';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { Theme, useTheme } from '@/contexts/Theme';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

type AlertModalProps = PropsWithChildren & {
  title?: string;
  message?: string;
  isVisible: boolean;
  disableOutsideClick?: boolean;
  onShow?: () => void;
  onClose: () => void;
  onDismissFinished?: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  children?: ReactNode;
};

const AlertModal = ({
  title,
  message,
  isVisible,
  disableOutsideClick = false,
  onShow,
  onClose,
  onDismissFinished,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  children,
}: AlertModalProps) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState<boolean>(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
        onDismissFinished?.();
      });
    }
  }, [isVisible]);

  if (!showModal) return null;

  return (
    <Modal
      animationType="none"
      transparent
      visible={showModal}
      onRequestClose={onClose}
      onShow={onShow}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor:
            theme === Theme.Light ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.2)',
          opacity: fadeAnim,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TouchableWithoutFeedback
          onPress={disableOutsideClick ? undefined : onClose}
        >
          <View className="absolute bottom-0 left-0 right-0 top-0" />
        </TouchableWithoutFeedback>
        <View className="max-h-[60%] w-4/5 self-center rounded-2xl bg-secondary-background shadow-xl">
          <View
            className={clsx(
              'flex flex-row items-center border-b border-tertiary-background px-4 py-2',
              title ? 'justify-between' : 'justify-end',
            )}
          >
            {title && (
              <Text className="flex-shrink text-lg font-semibold text-primary-text">
                {title}
              </Text>
            )}
            <SmallActionButton iconName="close-outline" onPress={onClose} />
          </View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 2,
              paddingHorizontal: 8,
            }}
          >
            {message && (
              <Text className="text-md my-2 px-2 font-light text-secondary-text">
                {message}
              </Text>
            )}
            {children}
          </ScrollView>
          {(cancelText || confirmText) && (
            <View className="flex-row justify-end border-t border-tertiary-background">
              {cancelText && (
                <Pressable
                  onPress={() => (onCancel ? onCancel?.() : onClose())}
                  hitSlop={DEFAULT_HIT_SLOP}
                  className="rounded-lg px-4 py-2"
                >
                  <Text className="font-medium text-secondary-text">
                    {cancelText}
                  </Text>
                </Pressable>
              )}
              {confirmText && (
                <Pressable
                  onPress={() => (onConfirm ? onConfirm?.() : onClose())}
                  hitSlop={DEFAULT_HIT_SLOP}
                  className="bg-primary rounded-lg px-4 py-2"
                >
                  <Text className="font-semibold text-primary-accent">
                    {confirmText}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default AlertModal;
