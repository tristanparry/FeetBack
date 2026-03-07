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

