import { z } from 'zod';

export const reviewMediaSchema = z.object({
  url: z.string().url('URL inválida'),
  type: z.enum(['image', 'video'], {
    required_error: 'Tipo de mídia inválido',
  }),
});

export const reviewFormSchema = z.object({
  booking_id: z.string().uuid('ID de reserva inválido'),
  rating: z
    .number()
    .min(1, 'A avaliação geral é obrigatória')
    .max(5, 'A avaliação deve ser entre 1 e 5'),
  cleanliness_rating: z
    .number()
    .min(1, 'A avaliação de limpeza é obrigatória')
    .max(5, 'A avaliação deve ser entre 1 e 5'),
  communication_rating: z
    .number()
    .min(1, 'A avaliação de comunicação é obrigatória')
    .max(5, 'A avaliação deve ser entre 1 e 5'),
  accuracy_rating: z
    .number()
    .min(1, 'A avaliação de precisão é obrigatória')
    .max(5, 'A avaliação deve ser entre 1 e 5'),
  value_rating: z
    .number()
    .min(1, 'A avaliação de custo-benefício é obrigatória')
    .max(5, 'A avaliação deve ser entre 1 e 5'),
  comment: z
    .string()
    .min(10, 'O comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'O comentário deve ter no máximo 1000 caracteres'),
  media: z.array(reviewMediaSchema).max(8, 'Máximo de 8 arquivos de mídia'),
});

export const reviewModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    required_error: 'Status inválido',
  }),
  rejection_reason: z.string().optional(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;
export type ReviewMedia = z.infer<typeof reviewMediaSchema>;
export type ReviewModeration = z.infer<typeof reviewModerationSchema>; 