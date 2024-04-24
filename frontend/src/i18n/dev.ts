import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { loadResourceBundles, getSupportedLanguages } from "@/i18n";
export const provider = i18n.use(LanguageDetector).use(initReactI18next);
provider
  .init({
    detection: {
      order: ["navigator"],
    },
    fallbackLng: "fr",
    supportedLngs: getSupportedLanguages(),
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => loadResourceBundles(provider), console.error);
