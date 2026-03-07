import { useTheme, ThemeSetting } from '@/contexts/Theme';
import Button, { ButtonProps } from '@/components/UI/Button';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const ThemeToggleButton = ({ textSize, iconSize, className }: ButtonProps) => {
  const { t } = useTranslation();
  const { themeSetting, toggleTheme } = useTheme();

  type IconNames = 'sunny-outline' | 'moon-outline' | 'settings-outline';

  const buttonIcon: Record<ThemeSetting, IconNames> = {
    light: 'sunny-outline',
    dark: 'moon-outline',
    system: 'settings-outline',
  };

  return (
    <Button
      text={t('profile.functions.theme.name')}
      textSize={textSize}
      onPress={toggleTheme}
      className={className}
      iconName={buttonIcon[themeSetting]}
      iconSize={iconSize}
    >
      <Text className="text-sm text-primary-accent">
        {t(`profile.functions.theme.${themeSetting}`)}
      </Text>
    </Button>
  );
};

export default ThemeToggleButton;
