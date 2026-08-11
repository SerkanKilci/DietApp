import { AxiosError } from 'axios';
import { TFunction } from 'i18next';

interface ApiErrorData {
  title?: string;
  code?: string;
  [key: string]: unknown;
}

// Backend artık her hata için dilden bağımsız bir `code` alanı dönüyor (bkz. ApiControllerBase.cs);
// `title` sadece log/Swagger amaçlı Türkçe kalıyor, kullanıcıya gösterilmiyor. Önce code'u
// errors.* çeviri tablosunda çözmeyi dene, yoksa çağıranın verdiği fallback'e düş.
export function getApiErrorMessage(error: unknown, t: TFunction, fallback?: string): string {
  const axiosError = error as AxiosError<ApiErrorData>;
  const data = axiosError?.response?.data;

  if (data?.code) {
    const translated = t(`errors.${data.code}`, { ...data, defaultValue: '' });
    if (translated) {
      return translated;
    }
  }

  return fallback ?? t('common.genericError');
}
