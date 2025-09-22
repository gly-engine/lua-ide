"use client"

import i18nCsv from "./i18n.csv";

const parseCsv = (csv: string) => {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const translations: Record<string, Record<string, string>> = {};

  headers.slice(1).forEach(header => {
    translations[header] = {};
  });

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const key = values[0];

    for (let j = 1; j < values.length; j++) {
      const lang = headers[j];
      translations[lang][key] = values[j];
    }
  }

  return translations;
};

export const translations = parseCsv(i18nCsv);

export type Language = "en" | "pt" | "es";
export type TranslationKey = keyof (typeof translations)["pt"];

export function useTranslation(language: Language) {
  return {
    t: (key: TranslationKey): string => {
      return translations[language]?.[key] || translations.en[key] || key;
    },
    language,
  };
}