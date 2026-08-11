import { z } from 'zod';
import { TFunction } from 'i18next';

export const emailSchema = (t: TFunction) =>
  z.string().trim().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid'));

export const passwordSchema = (t: TFunction) => z.string().min(8, t('validation.passwordMin'));
