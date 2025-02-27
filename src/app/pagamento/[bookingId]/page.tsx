import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { PaymentForm } from '@/components/payments/PaymentForm';
import { createPaymentIntent } from '@/lib/stripe';

interface PaymentPageProps {
  params: {
    bookingId: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: booking } = await supabase
    .from('reservas')
    .select(`
      *,
      barco:barcos (
        *,
        localizacao:localizacoes (*)
      )
    `)
    .eq('id', params.bookingId)
    .single();

  if (!booking) {
    redirect('/reservas');
  }

  if (booking.status !== 'pendente') {
    redirect('/reservas');
  }

  if (booking.usuario_id !== session.user.id) {
    redirect('/reservas');
  }

  let paymentIntent;
  const { data: existingPayment } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('reserva_id', booking.id)
    .single();

  if (!existingPayment) {
    paymentIntent = await createPaymentIntent({
      amount: booking.preco_total,
      bookingId: booking.id,
      userId: session.user.id,
    });
  } else {
    paymentIntent = {
      id: existingPayment.stripe_payment_intent_id,
      client_secret: existingPayment.stripe_client_secret,
    };
  }

  const paymentDetails = {
    booking,
    payment: {
      id: existingPayment?.id || '',
      booking_id: booking.id,
      amount: booking.preco_total,
      currency: 'BRL',
      status: 'pending' as const,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_client_secret: paymentIntent.client_secret,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-8 text-2xl font-bold">Finalizar Pagamento</h1>
      <PaymentForm paymentDetails={paymentDetails} />
    </div>
  );
} 