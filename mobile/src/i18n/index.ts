import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import { languageStorage } from '@/utils/kvStorage';
import tr from './locales/tr.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

export const SUPPORTED_LANGUAGES = ['tr', 'en', 'fr', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return Boolean(value) && (SUPPORTED_LANGUAGES as readonly string[]).includes(value as string);
}

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return isSupportedLanguage(deviceLanguageCode) ? deviceLanguageCode : DEFAULT_LANGUAGE;
}

export async function initI18n(): Promise<void> {
  const savedLanguage = await languageStorage.get();
  const language = isSupportedLanguage(savedLanguage) ? savedLanguage : resolveDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
  });
}

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  await languageStorage.set(language);
  await i18n.changeLanguage(language);
}

export default i18n;
