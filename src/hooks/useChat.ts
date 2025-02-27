'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Message, ChatRoom, ChatParticipant } from '@/types/chat';

export const useChat = (reservaId: string) => {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isTyping, setIsTyping] = useState(false);

  // Busca as mensagens da sala
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['chat-messages', reservaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('reserva_id', reservaId)
        .order('data_envio', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Busca os participantes da sala
  const { data: participants } = useQuery<ChatParticipant[]>({
    queryKey: ['chat-participants', reservaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_participantes')
        .select('*')
        .eq('reserva_id', reservaId);

      if (error) throw error;
      return data;
    },
  });

  // Envia uma nova mensagem
  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      recipientId,
      type = 'texto',
      fileUrl,
    }: {
      content: string;
      recipientId: string;
      type?: 'texto' | 'imagem';
      fileUrl?: string;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const message = {
        reserva_id: reservaId,
        remetente_id: session.session.user.id,
        destinatario_id: recipientId,
        conteudo: content,
        tipo: type,
        status: 'enviada',
        data_envio: new Date().toISOString(),
        arquivo_url: fileUrl,
      };

      const { error } = await supabase.from('mensagens').insert([message]);

      if (error) throw error;
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', reservaId] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    },
  });

  // Marca mensagens como lidas
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('mensagens')
        .update({
          status: 'lida',
          data_leitura: new Date().toISOString(),
        })
        .in('id', messageIds);

      if (error) throw error;
    },
  });

  // Inscreve-se nos eventos em tempo real
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${reservaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `reserva_id=eq.${reservaId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: ['chat-messages', reservaId],
          });
        }
      )
      .on(
        'presence',
        { event: 'sync' },
        () => {
          // Atualiza status online dos participantes
          queryClient.invalidateQueries({
            queryKey: ['chat-participants', reservaId],
          });
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user) {
            await channel.track({
              user_id: session.session.user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservaId, queryClient, supabase]);

  return {
    messages,
    participants,
    isLoadingMessages,
    sendMessage,
    markAsRead,
    isTyping,
  };
}; 