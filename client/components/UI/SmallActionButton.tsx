import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import clsx from 'clsx';
import { IconLibrary } from '@/types/ui';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type SmallActionButtonProps = {
  iconName?: IoniconName;
  iconSize?: number;
  iconClassName?: string;
  iconLibrary?: IconLibrary;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
};

const SmallActionButton = ({
  iconName,
  iconSize = 20,
  iconClassName,
  iconLibrary = 'ionicons',
  disabled = false,
  onPress,
  className,
}: SmallActionButtonProps) => {
  const { theme } = useTheme();
  const colors = jsColors[theme];

  const IconComponent = (() => {
    if (!iconName) return null;
    switch (iconLibrary) {
      case 'ionicons':
        return (
          <Ionicons
            name={iconName}
            size={iconSize}
            className={clsx(iconClassName ?? 'text-primary-text')}
          />
        );
      case 'materialcommunity':
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={iconSize}
            color={colors.primaryAccent}
            className={iconClassName}
          />
        );
      case 'entypo':
        return (
          <Entypo
            name={iconName as any}
            size={iconSize}
            color={colors.primaryAccent}
            className={iconClassName}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={DEFAULT_HIT_SLOP}
      className={clsx(
        'duration-10 items-center justify-center rounded-full transition ease-in-out active:bg-tertiary-background active:opacity-75',
        className,
      )}
    >
      {IconComponent}
    </Pressable>
  );
};

export default SmallActionButton;
