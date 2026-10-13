import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Language, TranslationKey } from '../i18n/translations'
import { LANGUAGE_STORAGE_KEY, getLanguage, setCurrentLanguage } from '../i18n/language'
import { translate, type TranslateParams } from '../i18n/translate'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  // t('key'), t('key', { name }) để chèn biến, hoặc t('key', 'fallback')
  t: (key: TranslationKey, paramsOrFallback?: TranslateParams | string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getLanguage)

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang)
    setLanguageState(lang)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  const t = (key: TranslationKey, paramsOrFallback?: TranslateParams | string): string =>
    typeof paramsOrFallback === 'string'
      ? translate(language, key, undefined, paramsOrFallback)
      : translate(language, key, paramsOrFallback)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
