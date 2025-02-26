import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

export const stripe = loadStripe(stripePublishableKey)

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

const stripeInstance = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

interface CreatePaymentIntentParams {
  amount: number;
  bookingId: string;
  userId: string;
}

export async function createPaymentIntent({
  amount,
  bookingId,
  userId,
}: CreatePaymentIntentParams) {
  const supabase = createServerComponentClient({ cookies });

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe trabalha com centavos
    currency: 'brl',
    metadata: {
      bookingId,
      userId,
    },
  });

  await supabase.from('pagamentos').insert({
    reserva_id: bookingId,
    usuario_id: userId,
    valor: amount,
    status: 'pendente',
    stripe_payment_intent_id: paymentIntent.id,
    stripe_client_secret: paymentIntent.client_secret,
  });

  return {
    id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
  };
} 