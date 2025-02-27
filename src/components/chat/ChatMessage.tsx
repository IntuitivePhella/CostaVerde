'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message, ChatParticipant } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  sender: ChatParticipant;
  isOwnMessage: boolean;
}

export const ChatMessage = ({
  message,
  sender,
  isOwnMessage,
}: ChatMessageProps) => {
  return (
    <div
      className={`flex w-full gap-2 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender.avatar_url || undefined} alt={sender.nome} />
        <AvatarFallback>
          {sender.nome
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex max-w-[70%] flex-col ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-lg p-3 ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {message.tipo === 'imagem' && message.arquivo_url ? (
            <div className="space-y-2">
              <img
                src={message.arquivo_url}
                alt="Imagem compartilhada"
                className="rounded-md"
              />
              {message.conteudo && (
                <p className="text-sm">{message.conteudo}</p>
              )}
            </div>
          ) : (
            <p className="text-sm">{message.conteudo}</p>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            {format(new Date(message.data_envio), "HH:mm '•' d 'de' MMM", {
              locale: ptBR,
            })}
          </span>
          {isOwnMessage && (
            <>
              {message.status === 'lida' ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 