import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { Text, Pressable, View } from 'react-native';
import clsx from 'clsx';
import { IconLibrary } from '@/types/ui';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';

export type ButtonProps = {
  text?: string;
  textSize?: number;
  iconName?: string;
  iconSize?: number;
  iconLibrary?: IconLibrary;
  disabled?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  secondaryButtonStyle?: boolean;
  buttonRowStyle?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const Button = ({
  text,
  textSize = 14,
  iconName,
  iconSize = 24,
  iconLibrary = 'ionicons',
  disabled = false,
  showChevron,
  onPress,
  secondaryButtonStyle = false,
  buttonRowStyle = false,
  className,
  children,
}: ButtonProps) => {
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
            className={
              secondaryButtonStyle
                ? 'text-primary-background'
                : 'text-primary-accent'
            }
          />
        );
      case 'materialcommunity':
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={iconSize}
            color={
              secondaryButtonStyle
                ? colors.primaryBackground
                : colors.primaryAccent
            }
          />
        );
      case 'entypo':
        return (
          <Entypo
            name={iconName as any}
            size={iconSize}
            color={
              secondaryButtonStyle
                ? colors.primaryBackground
                : colors.primaryAccent
            }
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={DEFAULT_HIT_SLOP}
      className={clsx(
        'duration-10 w-full flex-row items-center px-4 py-4 transition ease-in-out active:opacity-75',
        buttonRowStyle
          ? 'rounded-none bg-primary-background active:bg-secondary-background'
          : secondaryButtonStyle
            ? 'rounded-lg bg-primary-accent active:bg-secondary-accent'
            : 'rounded-lg bg-secondary-background active:bg-tertiary-background',
        disabled && 'opacity-50',
        className,
        !className?.includes('justify-') && 'justify-between',
      )}
    >
      <View className="flex-row items-center gap-4">
        {IconComponent}
        {text && (
          <Text
            style={{ fontSize: textSize }}
            className={clsx(
              'font-medium',
              secondaryButtonStyle
                ? 'text-primary-background'
                : 'text-primary-text',
            )}
          >
            {text}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={iconSize}
          className="text-tertiary-background"
        />
      )}
      {children}
    </Pressable>
  );
};

export default Button;
