import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_KEY } from '@/constants/app';
import { DEFAULT_LANGUAGE, LANGUAGE_RESOURCES } from '@/constants/i18n';

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag.split('-')[0];
  }
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources: LANGUAGE_RESOURCES,
    lng: savedLanguage,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: DEFAULT_LANGUAGE,
  });
};

initI18n();

export default i18n;
