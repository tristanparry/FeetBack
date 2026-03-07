import i18n from 'i18next';
import { DEFAULT_LANGUAGE, LANGUAGE_RESOURCES } from './types.ts';

const initI18n = async () => {
  i18n.init({
    compatibilityJSON: 'v4',
    resources: LANGUAGE_RESOURCES,
    lng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: DEFAULT_LANGUAGE,
  });
};

initI18n();

export default i18n;
