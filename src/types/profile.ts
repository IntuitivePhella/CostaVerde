import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string().uuid(),
  updated_at: z.string().datetime().nullable(),
  username: z.string().min(3),
  full_name: z.string().min(3),
  avatar_url: z.string().url().nullable(),
  phone: z.string().min(10),
  email: z.string().email(),
  created_at: z.string().datetime(),
});

export type Profile = z.infer<typeof profileSchema>;

export const profileFormSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export type ProfileUpdateData = Partial<ProfileFormData>;

// Constantes para validação
export const PHONE_REGEX = /^(\+55|0)\s*([1-9]{2})\s*9?[6-9]{1}[0-9]{3}\-?[0-9]{4}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/; 