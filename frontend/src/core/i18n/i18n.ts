import { useEffect, useState } from "react";

import { AppLocale } from "./locales";

export const loadTranslations = async (locale: AppLocale) => {
  const response = await fetch(`/locales/${locale}/translation.json`);
  return (await response.json()) as Record<string, unknown>;
};

export const useTranslations = (locale: AppLocale = "en") => {
  const [translations, setTranslations] = useState<Record<string, unknown>>({});

  useEffect(() => {
    loadTranslations(locale).then(setTranslations).catch(() => setTranslations({}));
  }, [locale]);

  return translations;
};
