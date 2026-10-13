export type Language = 'vi' | 'en'

export const LANGUAGE_STORAGE_KEY = 'app_language'

function readStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return saved === 'vi' || saved === 'en' ? saved : 'vi'
  } catch {
    return 'vi'
  }
}

// Ngôn ngữ hiện tại cho code nằm ngoài React (store, service, hàm tiện ích).
// LanguageProvider luôn cập nhật giá trị này khi người dùng đổi ngôn ngữ.
let currentLanguage: Language = readStoredLanguage()

export function getLanguage(): Language {
  return currentLanguage
}

export function setCurrentLanguage(language: Language) {
  currentLanguage = language
}

// Mã locale dùng cho Intl / toLocaleString
export function getLocale(language: Language = currentLanguage): string {
  return language === 'en' ? 'en-US' : 'vi-VN'
}
