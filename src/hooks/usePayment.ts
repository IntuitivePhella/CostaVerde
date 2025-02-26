import { useMutation, useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import type { PaymentDetails } from '@/types/payment';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const usePayment = (bookingId: string) => {
  // Busca os detalhes do pagamento
  const {
    data: paymentDetails,
    isLoading,
    error,
  } = useQuery<PaymentDetails>({
    queryKey: ['payment', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(
          `
          *,
          booking:bookings(
            id,
            data_inicio,
            data_fim,
            preco_total,
            barco:boats(
              id,
              nome,
              tipo,
              imagens,
              localizacao
            )
          )
        `
        )
        .eq('booking_id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Cria uma nova intenção de pagamento
  const createPaymentIntent = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
  });

  // Confirma o pagamento
  const confirmPayment = useMutation({
    mutationFn: async ({
      paymentIntentId,
      paymentMethodId,
    }: {
      paymentIntentId: string;
      paymentMethodId: string;
    }) => {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe não inicializado');

      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Atualiza o status da reserva
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmada' })
        .eq('id', bookingId);

      if (updateError) throw updateError;
    },
  });

  // Cancela o pagamento
  const cancelPayment = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Atualiza o status da reserva
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelada' })
        .eq('id', bookingId);

      if (updateError) throw updateError;
    },
  });

  return {
    paymentDetails,
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
    cancelPayment,
  };
}; 