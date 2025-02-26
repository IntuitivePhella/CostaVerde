import { z } from 'zod';

export const boatSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  owner_id: z.string().uuid(),
  name: z.string().min(3),
  description: z.string(),
  daily_rate: z.number().positive(),
  capacity: z.number().int().positive(),
  location: z.string(),
  boat_type: z.enum(['lancha', 'veleiro', 'iate', 'catamarã', 'jet_ski']),
  features: z.object({
    length: z.number().positive(),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    cabins: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    crew_included: z.boolean(),
    amenities: z.array(z.string()),
  }).nullable(),
  main_image_url: z.string().url().nullable(),
  gallery_urls: z.array(z.string().url()),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
});

export type Boat = z.infer<typeof boatSchema>;

export const boatFormSchema = boatSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  owner_id: true,
});

export type BoatFormData = z.infer<typeof boatFormSchema>;

export type BoatUpdateData = Partial<BoatFormData>;

export const BOAT_TYPES = [
  { value: 'lancha', label: 'Lancha' },
  { value: 'veleiro', label: 'Veleiro' },
  { value: 'iate', label: 'Iate' },
  { value: 'catamarã', label: 'Catamarã' },
  { value: 'jet_ski', label: 'Jet Ski' },
] as const;

export const BOAT_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'maintenance', label: 'Em Manutenção' },
] as const;

export type BoatSummary = Pick<
  Boat,
  | 'id'
  | 'name'
  | 'boat_type'
  | 'capacity'
  | 'daily_rate'
  | 'location'
  | 'gallery_urls'
  | 'status'
>; 