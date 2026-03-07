import Button from '@/components/UI/Button';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/Auth';
import LogInLogo from '@/assets/images/logInLogo.svg';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import CustomInput from '@/components/UI/CustomInput';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { userValidation } from '@/utils/Auth/validation';
import { AppRoutes } from '@/constants/app';
import clsx from 'clsx';

const Login = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const { isReady, isLoggedIn, isLoading, logIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isReady && isLoggedIn) {
      router.replace(AppRoutes.Home);
    }
  }, [isReady, isLoggedIn, router]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const formattedEmail = email.trim().toLowerCase();
    const validationError = userValidation(formattedEmail, password);
    setError(t(validationError));
    if (!validationError) {
      const loginError = await logIn(formattedEmail, password);
      if (loginError) setError(t(`login.validation.${loginError}`));
    }
  };

  if (!isReady || isLoggedIn) return null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-background p-8"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-between">
          <View className="mt-16 w-full items-center">
            <LogInLogo width={125} height={125} fill={colors.primaryAccent} />
            <View className="mt-8 w-full items-center gap-4">
              <CustomInput
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => passwordRef.current?.focus()}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                required
                returnKeyType="next"
              />
              <View className="relative w-full">
                <CustomInput
                  ref={passwordRef}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleLogin}
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  required
                  secure={!showPassword}
                />
                <SmallActionButton
                  iconName={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  iconSize={16}
                  onPress={() => setShowPassword((prev) => !prev)}
                  iconClassName="text-secondary-text"
                  className="absolute right-4 top-5"
                />
              </View>
              <Button
                iconName="log-in-outline"
                text={t('login.loginButton')}
                disabled={!email || !password || isLoading}
                onPress={handleLogin}
                secondaryButtonStyle
              />
              {error && <Text className="text-error">{error}</Text>}
              {isLoading && (
                <ActivityIndicator size="large" color={colors.primaryAccent} />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <View
        className={clsx(
          'flex-row items-center justify-center',
          Platform.OS === 'ios' && 'mb-8',
        )}
      >
        <Text className="italic text-secondary-text">
          {t('login.noAccount')}{' '}
        </Text>
        <Link href={AppRoutes.Register} replace>
          <Text className="font-semibold text-primary-accent">
            {t('login.registerButton')}
          </Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
