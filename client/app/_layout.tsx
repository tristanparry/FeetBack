import '@/constants/global_init';
import '@/global.css';
import { ThemeProvider, useTheme } from '@/contexts/Theme';
import ThemedStatusBar from '@/components/UI/ThemedStatusBar';
import { Stack } from 'expo-router';
import { jsColors } from '@/constants/themes';
import { AuthProvider, AuthGuard } from '@/contexts/Auth';
import { useTranslation } from 'react-i18next';

const InnerLayout = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];

  return (
    <>
      <ThemedStatusBar />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primaryBackground,
          },
          headerTintColor: colors.primaryText,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.primaryBackground,
          },
        }}
      >
        <Stack.Screen
          name="(protected)"
          options={{ headerShown: false, animation: 'none' }}
        />
        <Stack.Screen
          name="login"
          options={{ title: t('login.title'), animation: 'none' }}
        />
        <Stack.Screen
          name="register"
          options={{ title: t('register.title'), animation: 'none' }}
        />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <InnerLayout />
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
