import i18n from '../node_modules/i18next/index.js';
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
