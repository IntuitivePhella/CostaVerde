'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import type { ChatParticipant } from '@/types/chat';

interface ChatRoomProps {
  reservaId: string;
  otherParticipant: ChatParticipant;
}

export const ChatRoom = ({ reservaId, otherParticipant }: ChatRoomProps) => {
  const session = useSession();
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    participants,
    isLoadingMessages,
    sendMessage,
    markAsRead,
  } = useChat(reservaId);

  // Rola para a última mensagem quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marca mensagens como lidas quando visualizadas
  useEffect(() => {
    if (messages && session?.user) {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.destinatario_id === session.user.id &&
          msg.status !== 'lida'
      );

      if (unreadMessages.length > 0) {
        markAsRead.mutate(unreadMessages.map((msg) => msg.id));
      }
    }
  }, [messages, session?.user, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;

    try {
      await sendMessage.mutateAsync({
        content: messageInput.trim(),
        recipientId: otherParticipant.id,
        type: selectedFile ? 'imagem' : 'texto',
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      });

      setMessageInput('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="flex-1">
          <h2 className="font-medium">{otherParticipant.nome}</h2>
          <p className="text-sm text-muted-foreground">
            {otherParticipant.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              sender={
                participants?.find((p) => p.id === message.remetente_id) ||
                otherParticipant
              }
              isOwnMessage={message.remetente_id === session?.user?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() && !selectedFile}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {selectedFile && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="h-16 w-16 rounded object-cover"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              Remover
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 