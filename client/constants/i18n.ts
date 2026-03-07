import en from '@/i18n/locales/en.json';
import fr from '@/i18n/locales/fr.json';
import de from '@/i18n/locales/de.json';
import es from '@/i18n/locales/es.json';
import it from '@/i18n/locales/it.json';
import pt from '@/i18n/locales/pt.json';
import ru from '@/i18n/locales/ru.json';
import zh from '@/i18n/locales/zh.json';
import ja from '@/i18n/locales/ja.json';
import ko from '@/i18n/locales/ko.json';
import hi from '@/i18n/locales/hi.json';
import { LanguageCode } from '@/types/i18n';

export const LANGUAGE_RESOURCES = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  hi: { translation: hi },
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
