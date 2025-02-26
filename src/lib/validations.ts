import * as z from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Digite um email válido"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "O nome é obrigatório")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "O email é obrigatório")
      .email("Digite um email válido"),
    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .max(100, "A senha deve ter no máximo 100 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const boatSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres"),
  daily_rate: z.number().min(1, "O valor da diária deve ser maior que zero"),
  capacity: z.number().min(1, "A capacidade deve ser maior que zero"),
  location: z.string().min(3, "A localização deve ter no mínimo 3 caracteres"),
  boat_type: z.string().min(3, "O tipo de barco deve ter no mínimo 3 caracteres"),
  features: z.array(z.string()).min(1, "Selecione pelo menos uma característica"),
  images: z.array(z.string()).min(1, "Adicione pelo menos uma imagem"),
})

export const bookingSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  boat_id: z.string().uuid(),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "O comentário deve ter no mínimo 10 caracteres"),
  booking_id: z.string().uuid(),
})

export const profileSchema = z.object({
  full_name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  phone: z.string().min(11, "Telefone inválido"),
  avatar_url: z.string().url().optional().nullable(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type BoatFormData = z.infer<typeof boatSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type ProfileFormData = z.infer<typeof profileSchema> 