import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string().uuid(),
  reserva_id: z.string().uuid(),
  remetente_id: z.string().uuid(),
  destinatario_id: z.string().uuid(),
  conteudo: z.string().min(1),
  tipo: z.enum(['texto', 'imagem']),
  status: z.enum(['enviada', 'entregue', 'lida']),
  data_envio: z.string().datetime(),
  data_entrega: z.string().datetime().nullable(),
  data_leitura: z.string().datetime().nullable(),
  arquivo_url: z.string().url().optional(),
});

export type Message = z.infer<typeof messageSchema>;

export interface ChatRoom {
  id: string;
  reserva_id: string;
  participantes: {
    id: string;
    nome: string;
    avatar_url: string | null;
  }[];
  ultima_mensagem?: Message;
  mensagens_nao_lidas: number;
}

export interface ChatParticipant {
  id: string;
  nome: string;
  avatar_url: string | null;
  online: boolean;
  ultima_vez_online: string;
}

export const MESSAGE_STATUS = [
  { value: 'enviada', label: 'Enviada' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'lida', label: 'Lida' },
] as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[number]['value']; 