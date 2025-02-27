import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ChatRoom } from '@/components/chat/ChatRoom';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Busca a reserva e verifica se o usuário tem acesso
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
      )
    `)
    .eq('id', params.id)
    .single();

  if (!booking) {
    redirect('/reservas');
  }

  // Verifica se o usuário é o cliente ou o proprietário
  const isClient = booking.cliente.id === session.user.id;
  const isOwner = booking.barco.proprietario.id === session.user.id;

  if (!isClient && !isOwner) {
    redirect('/reservas');
  }

  // Define o outro participante do chat
  const otherParticipant = isClient
    ? booking.barco.proprietario
    : booking.cliente;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <ChatRoom
          reservaId={params.id}
          otherParticipant={{
            id: otherParticipant.id,
            nome: otherParticipant.nome,
            avatar_url: otherParticipant.avatar_url,
            online: false, // Será atualizado pelo hook useChat
            ultima_vez_online: new Date().toISOString(),
          }}
        />
      </div>
    </div>
  );
} 