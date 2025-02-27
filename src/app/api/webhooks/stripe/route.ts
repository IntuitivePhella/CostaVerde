import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    // Verifica a assinatura do webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const supabase = createServerComponentClient({ cookies });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.booking_id;

        // Atualiza o status do pagamento
        await supabase
          .from('pagamentos')
          .update({
            status: 'confirmado',
            data_confirmacao: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        // Atualiza o status da reserva
        await supabase
          .from('reservas')
          .update({ status: 'confirmada' })
          .eq('id', bookingId);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from('pagamentos')
          .update({
            status: 'falhou',
            erro_mensagem: paymentIntent.last_payment_error?.message,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        const { data: payment } = await supabase
          .from('pagamentos')
          .select('reserva_id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (payment) {
          await supabase
            .from('pagamentos')
            .update({
              status: 'reembolsado',
              data_reembolso: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntentId);

          await supabase
            .from('reservas')
            .update({ status: 'cancelada' })
            .eq('id', payment.reserva_id);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook do Stripe:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 400 }
    );
  }
} 