import { translations, type TranslationKey } from './translations'
import { getLanguage, type Language } from './language'

export type TranslateParams = Record<string, string | number>

// Dịch một khóa. Thứ tự ưu tiên: ngôn ngữ hiện tại → tiếng Việt → fallback → chính khóa.
// Chèn biến bằng cú pháp {name}. Nếu có `count` bằng 1, tiếng Anh dùng khóa `<key>_one` (nếu có).
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslateParams,
  fallback?: string,
): string {
  const dict = translations[language] as Record<string, string>
  const viDict = translations.vi as Record<string, string>

  let lookupKey: string = key
  if (language === 'en' && params?.count === 1 && `${key}_one` in dict) {
    lookupKey = `${key}_one`
  }

  let text = dict[lookupKey] ?? viDict[lookupKey] ?? fallback ?? key
  if (params) {
    text = text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    )
  }
  return text
}

// Dịch theo ngôn ngữ hiện tại cho code ngoài React (store, service, hàm tiện ích)
export function tNow(key: TranslationKey, params?: TranslateParams): string {
  return translate(getLanguage(), key, params)
}
