import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { paymentIntentId } = await request.json();

    const { data: payment } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    if (payment.usuario_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await stripe.paymentIntents.cancel(paymentIntentId);

    await supabase.from('pagamentos').update({
      status: 'cancelado',
      data_cancelamento: new Date().toISOString(),
    }).eq('id', payment.id);

    await supabase.from('reservas').update({
      status: 'cancelada',
    }).eq('id', payment.reserva_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar pagamento' },
      { status: 500 }
    );
  }
} 