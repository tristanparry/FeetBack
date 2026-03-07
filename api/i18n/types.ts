import de from './locales/de.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };
import fr from './locales/fr.json' with { type: 'json' };
import hi from './locales/hi.json' with { type: 'json' };
import it from './locales/it.json' with { type: 'json' };
import ja from './locales/ja.json' with { type: 'json' };
import ko from './locales/ko.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };
import ru from './locales/ru.json' with { type: 'json' };
import zh from './locales/zh.json' with { type: 'json' };

export const LANGUAGE_RESOURCES = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  hi: { translation: hi },
};

export enum Language {
  en = 'English',
  fr = 'Français',
  es = 'Español',
  de = 'Deutsch',
  it = 'Italiano',
  pt = 'Português',
  ru = 'Русский',
  zh = '中国人',
  ja = '日本語',
  ko = '한국인',
  hi = 'हिंदी',
}

export type LanguageCode = keyof typeof Language;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
