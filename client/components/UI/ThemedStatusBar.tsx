import { Theme, useTheme } from '@/contexts/Theme';
import { StatusBar } from 'expo-status-bar';

const ThemedStatusBar = () => {
  const { theme } = useTheme();

  return (
    <StatusBar
      style={theme === Theme.Light ? Theme.Dark : Theme.Light}
      translucent
    />
  );
};

export default ThemedStatusBar;
