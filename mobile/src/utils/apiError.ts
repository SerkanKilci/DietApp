import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Bir şeyler ters gitti, tekrar deneyin.'): string {
  const axiosError = error as AxiosError<{ title?: string }>;
  return axiosError?.response?.data?.title ?? fallback;
}
