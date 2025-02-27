import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { z } from 'zod';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

const createIntentSchema = z.object({
  booking_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { booking_id } = createIntentSchema.parse(body);

    // Busca a reserva
    const { data: booking } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (booking.usuario_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Verifica se já existe um pagamento
    const { data: existingPayment } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('reserva_id', booking_id)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        {
          id: existingPayment.stripe_payment_intent_id,
          client_secret: existingPayment.stripe_client_secret,
        },
        { status: 200 }
      );
    }

    // Cria a intenção de pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.preco_total * 100),
      currency: 'brl',
      metadata: {
        booking_id: booking.id,
        user_id: session.user.id,
      },
    });

    // Registra o pagamento no banco
    await supabase.from('pagamentos').insert({
      reserva_id: booking.id,
      usuario_id: session.user.id,
      valor: booking.preco_total,
      status: 'pendente',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_client_secret: paymentIntent.client_secret,
    });

    return NextResponse.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erro ao criar intenção de pagamento:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 