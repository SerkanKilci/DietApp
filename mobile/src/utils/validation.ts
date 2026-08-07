import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email gerekli').email('Geçerli bir email girin');
export const passwordSchema = z.string().min(8, 'Şifre en az 8 karakter olmalı');
