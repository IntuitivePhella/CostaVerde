import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';
import { z } from 'zod';

const refundSchema = z.object({
  payment_id: z.string().uuid(),
  reason: z.string().optional(),
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

    const body = await request.json();
    const { payment_id, reason } = refundSchema.parse(body);

    // Busca o pagamento
    const { data: payment } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o pagamento pertence ao usuário
    if (payment.usuario_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verifica se o pagamento já foi reembolsado
    if (payment.status === 'reembolsado') {
      return NextResponse.json(
        { error: 'Pagamento já foi reembolsado' },
        { status: 400 }
      );
    }

    // Verifica se o pagamento foi confirmado
    if (payment.status !== 'confirmado') {
      return NextResponse.json(
        { error: 'Pagamento não pode ser reembolsado' },
        { status: 400 }
      );
    }

    // Busca a reserva
    const { data: booking } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', payment.reserva_id)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Verifica a política de reembolso
    const startDate = new Date(booking.data_inicio);
    const now = new Date();
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let refundAmount = booking.preco_total;

    // Política de reembolso:
    // - Mais de 7 dias: 100%
    // - Entre 3 e 7 dias: 50%
    // - Menos de 3 dias: 0%
    if (daysUntilStart <= 3) {
      return NextResponse.json(
        { error: 'Período de reembolso expirado' },
        { status: 400 }
      );
    } else if (daysUntilStart <= 7) {
      refundAmount = Math.floor(refundAmount * 0.5);
    }

    // Processa o reembolso no Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100), // Converte para centavos
      reason: 'requested_by_customer',
    });

    // Atualiza o status do pagamento
    await supabase.from('pagamentos').update({
      status: 'reembolsado',
      data_reembolso: new Date().toISOString(),
      valor_reembolso: refundAmount,
    }).eq('id', payment_id);

    // Atualiza o status da reserva
    await supabase.from('reservas').update({
      status: 'cancelada',
    }).eq('id', payment.reserva_id);

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
      },
    });
  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar reembolso' },
      { status: 500 }
    );
  }
} 