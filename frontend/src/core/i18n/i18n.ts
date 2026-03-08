import { useEffect, useState } from "react";

import { AppLocale } from "./locales";

type TranslationMap = Record<string, unknown>;

declare global {
  interface Window {
    __rentalTranslations?: Partial<Record<AppLocale, TranslationMap>>;
  }
}

export const loadTranslations = async (locale: AppLocale) => {
  const response = await fetch(`/locales/${locale}/translation.json`);
  const payload = (await response.json()) as TranslationMap;
  if (typeof window !== "undefined") {
    window.__rentalTranslations = {
      ...(window.__rentalTranslations || {}),
      [locale]: payload,
    };
  }
  return payload;
};

export const useTranslations = (locale: AppLocale = "en") => {
  const [translations, setTranslations] = useState<TranslationMap>({});

  useEffect(() => {
    loadTranslations(locale).then(setTranslations).catch(() => setTranslations({}));
  }, [locale]);

  return translations;
};

const getNestedTranslation = (source: TranslationMap, key: string) =>
  key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as TranslationMap)[part];
    }
    return undefined;
  }, source);

export const t = (key: string, fallback?: string) => {
  if (typeof window === "undefined") {
    return fallback ?? key;
  }

  const locale = (window.localStorage.getItem("rental_saas_locale") as AppLocale | null) || "en";
  const localeMessages = window.__rentalTranslations?.[locale] ?? window.__rentalTranslations?.en;
  const value = localeMessages ? getNestedTranslation(localeMessages, key) : undefined;

  return typeof value === "string" ? value : fallback ?? key;
};
