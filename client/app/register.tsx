import Button from '@/components/UI/Button';
import { useRef, useState, useEffect } from 'react';
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
import RegisterLogo from '@/assets/images/registerLogo.svg';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';
import CustomInput from '@/components/UI/CustomInput';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { userValidation } from '@/utils/Auth/validation';
import { useAuth } from '@/contexts/Auth';
import { AppRoutes } from '@/constants/app';
import clsx from 'clsx';

const Register = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = jsColors[theme];
  const { isReady, isLoggedIn, isLoading, register } = useAuth();
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

  const handleRegister = async () => {
    Keyboard.dismiss();
    const formattedEmail = email.trim().toLowerCase();
    const validationError = userValidation(formattedEmail, password);
    setError(t(validationError));
    if (!validationError) {
      const registerError = await register(formattedEmail, password);
      if (registerError) setError(t(`register.validation.${registerError}`));
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
          <View className="mt-32 w-full items-center">
            <RegisterLogo width={250} height={60} fill={colors.primaryAccent} />
            <View className="mt-8 w-full items-center gap-4">
              <CustomInput
                placeholder={t('register.emailPlaceholder')}
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
                  placeholder={t('register.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleRegister}
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
                iconName="person-add-outline"
                text={t('register.registerButton')}
                disabled={!email || !password || isLoading}
                onPress={handleRegister}
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
          {t('register.existingAccount')}{' '}
        </Text>
        <Link href={AppRoutes.Login} replace>
          <Text className="font-semibold text-primary-accent">
            {t('register.loginButton')}
          </Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
