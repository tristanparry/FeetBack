import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Button, { ButtonProps } from '@/components/UI/Button';
import { Text, Pressable } from 'react-native';
import { useState } from 'react';
import { LANGUAGE_KEY } from '@/constants/app';
import { Language, LanguageCode } from '@/types/i18n';
import AlertModal from '@/components/UI/AlertModal';
import { useAuth } from '@/contexts/Auth';
import { updateProfile } from '@/utils/api/routes/users';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const UserLanguageButton = ({ textSize, iconSize, className }: ButtonProps) => {
  const { i18n, t } = useTranslation();
  const { user, fetchCurrentUser } = useAuth();
  const currentLanguage = user?.language ?? i18n.language;
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const changeLanguage = async (lang: LanguageCode) => {
    try {
      if (lang === user?.language) return;
      await updateProfile({ language: lang });
      await fetchCurrentUser();
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      i18n.changeLanguage(lang);
    } catch (e) {
      console.error('Failed to change language', e);
    } finally {
      setShowAlert(false);
    }
  };

  return (
    <>
      <Button
        text={t('accountInfo.functions.language.title')}
        textSize={textSize}
        onPress={() => setShowAlert(true)}
        className={className}
        iconName="globe-outline"
        iconSize={iconSize}
        buttonRowStyle
      >
        <Text className="text-sm text-primary-accent">
          {Language[currentLanguage as keyof typeof Language]}
        </Text>
      </Button>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('accountInfo.functions.language.title')}
      >
        {Object.entries(Language).map(([lang, name]) => (
          <Pressable
            key={lang}
            onPress={() => changeLanguage(lang as LanguageCode)}
            hitSlop={DEFAULT_HIT_SLOP}
            className="flex-row items-center justify-between rounded-lg px-3 py-2 active:bg-tertiary-background"
          >
            <Text
              className={
                lang === currentLanguage
                  ? 'font-semibold text-primary-accent'
                  : 'text-primary-text'
              }
            >
              {name}
            </Text>
            {lang === currentLanguage && (
              <Text className="text-primary-accent">✓</Text>
            )}
          </Pressable>
        ))}
      </AlertModal>
    </>
  );
};

export default UserLanguageButton;
