import { useTranslation } from 'react-i18next';
import Button, { ButtonProps } from '@/components/UI/Button';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { Text, TextInput, View, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import AlertModal from '@/components/UI/AlertModal';
import CustomInput from '@/components/UI/CustomInput';
import { passwordValidation } from '@/utils/Auth/validation';
import { useAuth } from '@/contexts/Auth';
import { updateProfile } from '@/utils/api/routes/users';

const UserPasswordButton = ({ textSize, iconSize, className }: ButtonProps) => {
  const { t } = useTranslation();
  const { fetchCurrentUser } = useAuth();
  const [inputPassword, setInputPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputPasswordRef = useRef<TextInput>(null);
  const [error, setError] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const closeModal = () => {
    setShowAlert(false);
    setInputPassword('');
    setShowPassword(false);
    setError('');
  };

  const handlePasswordChange = async () => {
    Keyboard.dismiss();
    try {
      const validationError = passwordValidation(inputPassword);
      setError(t(validationError));
      if (!validationError) {
        await updateProfile({ password: inputPassword });
        await fetchCurrentUser();
        closeModal();
      }
    } catch (e) {
      console.error('Failed to change password', e);
    }
  };

  return (
    <>
      <Button
        text={t('accountInfo.functions.userPassword.title')}
        textSize={textSize}
        onPress={() => setShowAlert(true)}
        className={className}
        iconName="document-lock-outline"
        iconSize={iconSize}
        buttonRowStyle
      >
        <Text className="text-sm text-primary-accent">********</Text>
      </Button>
      <AlertModal
        isVisible={showAlert}
        onShow={() =>
          setTimeout(() => {
            inputPasswordRef.current?.focus();
          }, 100)
        }
        onClose={closeModal}
        title={t('accountInfo.functions.userPassword.title')}
        cancelText={t('common.cancel')}
        onCancel={closeModal}
        confirmText={t('common.ok')}
        onConfirm={handlePasswordChange}
      >
        <View className="relative my-4 w-full">
          <CustomInput
            ref={inputPasswordRef}
            placeholder={t('accountInfo.functions.userPassword.title')}
            value={inputPassword}
            onChangeText={setInputPassword}
            onSubmitEditing={handlePasswordChange}
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
        {error && <Text className="px-2 pb-4 text-error">{error}</Text>}
      </AlertModal>
    </>
  );
};

export default UserPasswordButton;
