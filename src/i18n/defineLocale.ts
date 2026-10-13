// Khai báo bản dịch của một nhóm tính năng.
// TypeScript sẽ báo lỗi ngay nếu `en` thiếu hoặc thừa khóa so với `vi`.
export function defineLocale<const V extends Record<string, string>>(
  vi: V,
  en: Record<keyof V, string>,
) {
  return { vi, en }
}
