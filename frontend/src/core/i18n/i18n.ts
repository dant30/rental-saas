import { useEffect, useState } from "react";

import { AppLocale, supportedLocales } from "./locales";

type TranslationMap = Record<string, unknown>;

declare global {
  interface Window {
    __rentalTranslations?: Partial<Record<AppLocale, TranslationMap>>;
  }
}

export const loadTranslations = async (locale: AppLocale) => {
  const cached = typeof window !== "undefined" ? window.__rentalTranslations?.[locale] : undefined;
  if (cached) {
    return cached;
  }

  const response = await fetch(`/locales/${locale}/translation.json`);
  if (!response.ok) {
    throw new Error(`Unable to load translations for ${locale}`);
  }
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
  const [translations, setTranslations] = useState<TranslationMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }
    return window.__rentalTranslations?.[locale] || {};
  });

  useEffect(() => {
    let cancelled = false;
    loadTranslations(locale)
      .then((payload) => {
        if (!cancelled) {
          setTranslations(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTranslations({});
        }
      });

    return () => {
      cancelled = true;
    };
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

  const rawLocale = window.localStorage.getItem("rental_saas_locale");
  const locale = supportedLocales.includes(rawLocale as AppLocale) ? (rawLocale as AppLocale) : "en";
  const localeMessages = window.__rentalTranslations?.[locale] ?? window.__rentalTranslations?.en;
  const value = localeMessages ? getNestedTranslation(localeMessages, key) : undefined;

  return typeof value === "string" ? value : fallback ?? key;
};
