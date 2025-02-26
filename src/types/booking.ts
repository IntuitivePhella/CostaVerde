import { z } from 'zod';

export const bookingSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
  boat_id: z.string().uuid(),
  user_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  total_amount: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
  payment_status: z.enum(['pending', 'paid', 'refunded']).default('pending'),
});

export type Booking = z.infer<typeof bookingSchema>;

export const bookingFormSchema = bookingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
  status: true,
  payment_status: true,
}).extend({
  start_date: z.date(),
  end_date: z.date(),
}).refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "A data final deve ser posterior à data inicial",
    path: ["end_date"],
  }
);

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export type BookingUpdateData = Partial<Omit<BookingFormData, 'boat_id'>>;

export const BOOKING_STATUS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'completed', label: 'Concluída' },
] as const;

export const PAYMENT_STATUS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'refunded', label: 'Reembolsado' },
] as const;

export interface BookingWithDetails extends Booking {
  barco: {
    id: string;
    nome: string;
    tipo: string;
    preco_dia: number;
    imagens: string[];
    localizacao: {
      cidade: string;
      estado: string;
    };
  };
  usuario: {
    id: string;
    nome_completo: string;
    foto_perfil?: string;
  };
}

export interface CreateBookingData {
  barco_id: string;
  data_inicio: string;
  data_fim: string;
}

export interface BookingAvailability {
  available: boolean;
  conflicting_dates?: {
    data_inicio: string;
    data_fim: string;
  }[];
  preco_total?: number;
} 