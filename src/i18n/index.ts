import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: localStorage.getItem('pizca_lang') || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
