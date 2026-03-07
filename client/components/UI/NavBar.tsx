import BLEConnectButton from '@/components/BLE/BLEConnectButton';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HapticTab from '@/components/UI/HapticTab';
import { View, Platform } from 'react-native';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import UnmountOnBlur from '@/utils/UI/UnmountOnBlur';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];

  const PillBackground = () => (
    <View
      style={{
        flex: 1,
        borderRadius: 10,
        backgroundColor: colors.secondaryBackground,
      }}
    />
  );

  return (
    <Tabs
      screenLayout={({ children }) => <UnmountOnBlur>{children}</UnmountOnBlur>}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primaryBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primaryText,
        ...(Platform.OS === 'ios' && { headerTitleAlign: 'left' }),
        tabBarActiveTintColor: colors.primaryAccent,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 20,
          bottom: 15,
          height: 52,
          borderRadius: 10,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          // iOS shadow
          shadowColor: 'hsl(0, 0%, 0%)',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          // Android shadow
          elevation: 4,
          overflow: 'hidden',
        },
        tabBarBackground: () => <PillBackground />,
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: Platform.OS === 'ios' ? -8 : 2,
        },
        tabBarItemStyle: { paddingVertical: 0, borderRadius: 10 },
        tabBarButton: HapticTab,
        tabBarIconStyle: {
          marginTop: 2,
          width: 25,
          height: 25,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.title'),
          tabBarLabel: t('home.tabLabel'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          headerRight: () => (
            <FadeAnimation axis="horizontal">
              <View className="mr-2 flex-row items-center">
                <BLEConnectButton />
              </View>
            </FadeAnimation>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: t('health.title'),
          tabBarLabel: t('health.tabLabel'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" color={color} size={size} />
          ),
          headerRight: () => (
            <View className="mr-2 flex-row items-center">
              <BLEConnectButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('history.title'),
          tabBarLabel: t('history.tabLabel'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
          headerRight: () => (
            <View className="mr-2 flex-row items-center">
              <BLEConnectButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarLabel: t('profile.tabLabel'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default NavBar;
