// App Routes
export const AppRoutes = {
  Home: '/',
  Health: '/health',
  History: '/history',
  Profile: '/profile',
  AccountInfo: '/accountInfo',
  ManageInsoles: '/manageInsoles',
  Login: '/login',
  Register: '/register',
} as const;

// AsyncStorage Keys
export const AUTH_ACCESS_KEY = 'auth-access-key';
export const AUTH_REFRESH_KEY = 'auth-refresh-key';
export const THEME_KEY = 'theme-key';
export const LANGUAGE_KEY = 'lang-key';
export const TEMPERATURE_UNIT_KEY = 'temp-key';
