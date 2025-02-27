import { z } from 'zod';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripe_payment_intent_id: string;
  stripe_client_secret?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentIntent {
  booking_id: string;
  amount: number;
  currency: string;
}

export interface PaymentDetails {
  payment: Payment;
  booking: {
    id: string;
    data_inicio: string;
    data_fim: string;
    preco_total: number;
    barco: {
      id: string;
      nome: string;
      tipo: string;
      imagens: string[];
      localizacao: {
        cidade: string;
        estado: string;
      };
    };
  };
}

export const paymentSchema = z.object({
  id: z.string().uuid(),
  reserva_id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  valor: z.number().positive(),
  moeda: z.string().default('BRL'),
  status: z.enum(['pendente', 'confirmado', 'cancelado', 'reembolsado']),
  stripe_payment_intent_id: z.string(),
  stripe_client_secret: z.string().optional(),
  erro_mensagem: z.string().optional(),
  data_criacao: z.string().datetime(),
  data_atualizacao: z.string().datetime(),
  data_confirmacao: z.string().datetime().optional(),
  data_cancelamento: z.string().datetime().optional(),
  data_reembolso: z.string().datetime().optional(),
  comprovante_url: z.string().url().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const PAYMENT_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'reembolsado', label: 'Reembolsado' },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number]['value']; 