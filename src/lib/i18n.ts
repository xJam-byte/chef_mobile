import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import ru from './locales/ru.json';
import en from './locales/en.json';
import kk from './locales/kk.json';

const LANGUAGE_KEY = '@chef_app_language';

// Get saved language or default to Russian
const getInitialLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        return savedLanguage || 'ru';
    } catch {
        return 'ru';
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            en: { translation: en },
            kk: { translation: kk },
        },
        lng: 'ru', // Default language
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false,
        },
    });

// Load saved language on init
getInitialLanguage().then((lng) => {
    i18n.changeLanguage(lng);
});

// Save language when it changes
i18n.on('languageChanged', (lng) => {
    AsyncStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;

export const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => i18n.language;
