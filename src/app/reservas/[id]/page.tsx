import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PaymentReceipt } from '@/components/payments/PaymentReceipt';

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
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
        proprietario:usuarios (
          id,
          nome,
          avatar_url
        )
      ),
      cliente:usuarios (
        id,
        nome,
        avatar_url
      ),
      pagamento:pagamentos (*)
    `)
    .eq('id', params.id)
    .single();

  if (!booking) {
    redirect('/reservas');
  }

  const isClient = booking.cliente.id === session.user.id;
  const isOwner = booking.barco.proprietario.id === session.user.id;

  if (!isClient && !isOwner) {
    redirect('/reservas');
  }

  const otherParticipant = isClient
    ? booking.barco.proprietario
    : booking.cliente;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes da Reserva</h1>
        <Link href={`/reservas/${params.id}/chat`}>
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat com {otherParticipant.nome}
          </Button>
        </Link>
      </div>

      <div className="grid gap-8">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Informações da Reserva</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Embarcação</p>
                <p className="font-medium">{booking.barco.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proprietário</p>
                <p className="font-medium">{booking.barco.proprietario.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">
                  {format(new Date(booking.data_inicio), "d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Término</p>
                <p className="font-medium">
                  {format(new Date(booking.data_fim), "d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{booking.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(booking.preco_total)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {booking.pagamento && (
          <PaymentReceipt
            payment={booking.pagamento}
            booking={{
              id: booking.id,
              data_inicio: booking.data_inicio,
              data_fim: booking.data_fim,
              preco_total: booking.preco_total,
              barco: {
                nome: booking.barco.nome,
                localizacao: booking.barco.localizacao,
              },
            }}
          />
        )}
      </div>
    </div>
  );
} 