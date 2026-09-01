"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Lang, translations, translateCategoryName } from "./i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCategory: (name: string) => string;
}

const STORAGE_KEY = "pulnazorat-lang";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "uz" || stored === "ru") setLangState(stored);
    } catch {
      // localStorage mavjud bo'lmasa ham davom etadi
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // e'tiborsiz qoldiriladi
    }
  }

  function t(key: string, params?: Record<string, string | number>): string {
    let value = translations[lang][key] ?? translations.uz[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  }

  function tCategory(name: string): string {
    return translateCategoryName(name, lang);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tCategory }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage LanguageProvider ichida ishlatilishi kerak");
  return ctx;
}
