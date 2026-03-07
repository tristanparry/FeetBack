import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_KEY } from '@/constants/app';
import {
  themes,
  LightNavigationTheme,
  DarkNavigationTheme,
} from '@/constants/themes';
import { colorScheme } from 'nativewind';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance, View } from 'react-native';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum ThemeSetting {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export const ThemeContext = createContext<{
  theme: Theme;
  themeSetting: ThemeSetting;
  toggleTheme: () => void;
}>({
  theme: Theme.Light,
  themeSetting: ThemeSetting.Light,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(
    ThemeSetting.Light,
  );
  const [theme, setTheme] = useState<Theme>(Theme.Light);

  const resolveTheme = (setting: ThemeSetting): Theme => {
    if (setting === ThemeSetting.System) {
      return Appearance.getColorScheme() === Theme.Dark
        ? Theme.Dark
        : Theme.Light;
    }
    return setting === ThemeSetting.Dark ? Theme.Dark : Theme.Light;
  };

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      const setting = (stored as ThemeSetting) || ThemeSetting.System;
      setThemeSetting(setting);
      const resolved = resolveTheme(setting);
      setTheme(resolved);
      colorScheme.set(resolved);
    })();
  }, []);

  const toggleTheme = async () => {
    const next: ThemeSetting =
      themeSetting === ThemeSetting.Light
        ? ThemeSetting.Dark
        : themeSetting === ThemeSetting.Dark
          ? ThemeSetting.System
          : ThemeSetting.Light;
    await AsyncStorage.setItem(THEME_KEY, next);
    setThemeSetting(next);
    const resolved = resolveTheme(next);
    setTheme(resolved);
    colorScheme.set(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeSetting, toggleTheme }}>
      <NavigationThemeProvider
        value={
          theme === Theme.Dark ? DarkNavigationTheme : LightNavigationTheme
        }
      >
        <View style={themes[theme]} className="flex-1">
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
};
