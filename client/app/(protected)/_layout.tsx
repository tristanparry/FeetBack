import { BLEProvider } from '@/contexts/BLE';
import { useTheme } from '@/contexts/Theme';
import { Redirect, Stack } from 'expo-router';
import { jsColors } from '@/constants/themes';
import { useAuth } from '@/contexts/Auth';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from '@/constants/app';
import { Platform } from 'react-native';

const InnerProtectedLayout = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const { isReady, isLoggedIn } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href={AppRoutes.Login} />;
  }

  return (
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
        ...(Platform.OS === 'ios' && {
          headerBackTitle: t('common.back'),
          headerBackButtonDisplayMode: 'minimal',
        }),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="accountInfo"
        options={{ title: t('accountInfo.title') }}
      />
      <Stack.Screen
        name="manageInsoles"
        options={{ title: t('manageInsoles.title') }}
      />
    </Stack>
  );
};

const ProtectedLayout = () => {
  return (
    <BLEProvider>
      <InnerProtectedLayout />
    </BLEProvider>
  );
};

export default ProtectedLayout;
