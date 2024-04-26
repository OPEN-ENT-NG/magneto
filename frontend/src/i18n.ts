import i18n, { Resource } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { dictionaries } from "~/dictionaries";

const resources: Resource = {};
Object.keys(dictionaries).forEach((k: string) => {
  resources[k] = {
    translation: dictionaries[k],
  };
});

const supportedLngs = Object.keys(dictionaries);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ["navigator"],
    },
    resources,
    fallbackLng: "fr",
    supportedLngs,
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((err) => console.error("failed to init i18n provider", err));
