import {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useContext,
} from 'react';
import { User } from '@/types/auth';
import { SplashScreen, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTH_ACCESS_KEY,
  AUTH_REFRESH_KEY,
  LANGUAGE_KEY,
  TEMPERATURE_UNIT_KEY,
} from '@/constants/app';
import { DEFAULT_TEMP_UNIT } from '@/constants/temperature';
import { DEFAULT_LANGUAGE } from '@/constants/i18n';
import { useTranslation } from 'react-i18next';
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from '@/utils/api/routes/users';
import { AppRoutes } from '@/constants/app';

SplashScreen.preventAutoHideAsync();

type AuthContextType = {
  isReady: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  fetchCurrentUser: () => void;
  register: (email: User['email'], password: string) => Promise<string | null>;
  logIn: (email: User['email'], password: string) => Promise<string | null>;
  logOut: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isReady: false,
  isLoggedIn: false,
  isLoading: false,
  user: null,
  fetchCurrentUser: async () => {},
  register: async () => null,
  logIn: async () => null,
  logOut: async () => {},
});
export const useAuth = () => useContext(AuthContext)!;

const AuthProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (e) {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const register = async (email: User['email'], password: string) => {
    setIsLoading(true);
    try {
      const response = await registerUser({ email, password });
      const { user: newUser, accessToken, refreshToken } = response.data;
      await AsyncStorage.setItem(AUTH_ACCESS_KEY, accessToken);
      await AsyncStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
      await AsyncStorage.setItem(
        LANGUAGE_KEY,
        newUser?.language ?? DEFAULT_LANGUAGE,
      );
      i18n.changeLanguage(newUser?.language ?? DEFAULT_LANGUAGE);
      await AsyncStorage.setItem(
        TEMPERATURE_UNIT_KEY,
        newUser?.temp_unit ?? DEFAULT_TEMP_UNIT,
      );
      setUser(newUser);
      setIsLoggedIn(true);
      router.replace(AppRoutes.Home);
      return null;
    } catch (e: any) {
      return e.response.data.error ?? 'UNKNOWN';
    } finally {
      setIsLoading(false);
    }
  };

  const logIn = async (
    email: User['email'],
    password: string,
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      const { user: loggedInUser, accessToken, refreshToken } = response.data;
      await AsyncStorage.setItem(AUTH_ACCESS_KEY, accessToken);
      await AsyncStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
      await AsyncStorage.setItem(
        LANGUAGE_KEY,
        loggedInUser?.language ?? DEFAULT_LANGUAGE,
      );
      i18n.changeLanguage(loggedInUser?.language ?? DEFAULT_LANGUAGE);
      await AsyncStorage.setItem(
        TEMPERATURE_UNIT_KEY,
        loggedInUser?.temp_unit ?? DEFAULT_TEMP_UNIT,
      );
      setUser(loggedInUser);
      setIsLoggedIn(true);
      router.replace(AppRoutes.Home);
      return null;
    } catch (e: any) {
      return e.response.data.error ?? 'UNKNOWN';
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
      await logoutUser({ token });
      await AsyncStorage.removeItem(AUTH_ACCESS_KEY);
      await AsyncStorage.removeItem(AUTH_REFRESH_KEY);
      setUser(null);
      setIsLoggedIn(false);
      router.replace(AppRoutes.Login);
    } catch (e: any) {
      return e.response.data.error ?? 'UNKNOWN';
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
        if (accessToken) {
          await fetchCurrentUser();
        }
      } catch (e) {
        console.error('Error fetching auth state:', e);
      }
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        isLoading,
        user,
        fetchCurrentUser,
        register,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
