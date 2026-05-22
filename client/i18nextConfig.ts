// src/i18next.ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en-US",
    debug: false,
    returnObjects: true,
    interpolation: { escapeValue: false },
    backend: { loadPath: "/locale/{{lng}}/{{ns}}.json" },
    ns: ["translation", "auth", "connection", "notification"],
    defaultNS: "translation",
    detection: {
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith("en")) return "en-US";
        return lng;
      },
    },
  });

export default i18next;
