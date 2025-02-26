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