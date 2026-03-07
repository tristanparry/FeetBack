import { useTranslation } from 'react-i18next';
import Button, { ButtonProps } from '@/components/UI/Button';
import { Text, TextInput, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import AlertModal from '@/components/UI/AlertModal';
import CustomInput from '@/components/UI/CustomInput';
import { useAuth } from '@/contexts/Auth';
import { updateProfile } from '@/utils/api/routes/users';

const UserNameButton = ({ textSize, iconSize, className }: ButtonProps) => {
  const { t } = useTranslation();
  const { user, fetchCurrentUser } = useAuth();
  const [inputName, setInputName] = useState<string>(user?.name ?? '');
  const inputNameRef = useRef<TextInput>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleNameChange = async () => {
    Keyboard.dismiss();
    try {
      const formattedName =
        inputName?.trim().length < 254 ? inputName?.trim() : user?.name;
      if (formattedName === user?.name) return;
      await updateProfile({ name: formattedName });
      await fetchCurrentUser();
    } catch (e) {
      console.error('Failed to change name', e);
    } finally {
      setShowAlert(false);
    }
  };

  return (
    <>
      <Button
        text={t('accountInfo.functions.userName.title')}
        textSize={textSize}
        onPress={() => {
          setInputName(user?.name ?? '');
          setShowAlert(true);
        }}
        className={className}
        iconName="person-circle-outline"
        iconSize={iconSize}
        buttonRowStyle
      >
        <Text className="text-sm text-primary-accent">{user?.name}</Text>
      </Button>
      <AlertModal
        isVisible={showAlert}
        onShow={() =>
          setTimeout(() => {
            inputNameRef.current?.focus();
          }, 100)
        }
        onClose={() => setShowAlert(false)}
        title={t('accountInfo.functions.userName.title')}
        cancelText={t('common.cancel')}
        onCancel={() => setShowAlert(false)}
        confirmText={t('common.ok')}
        onConfirm={handleNameChange}
      >
        <CustomInput
          ref={inputNameRef}
          value={inputName}
          onChangeText={setInputName}
          onSubmitEditing={handleNameChange}
          className="my-4"
        />
      </AlertModal>
    </>
  );
};

export default UserNameButton;
