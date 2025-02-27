'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Payment } from '@/types/payment';

interface PaymentReceiptProps {
  payment: Payment;
  booking: {
    id: string;
    data_inicio: string;
    data_fim: string;
    preco_total: number;
    barco: {
      nome: string;
      localizacao: {
        cidade: string;
        estado: string;
      };
    };
  };
}

export const PaymentReceipt = ({ payment, booking }: PaymentReceiptProps) => {
  const downloadReceipt = () => {
    if (payment.comprovante_url) {
      window.open(payment.comprovante_url, '_blank');
    }
  };

  const preco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(booking.preco_total);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Comprovante de Pagamento</h2>
        </div>
        {payment.comprovante_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReceipt}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Detalhes da Reserva</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Embarcação</span>
              <span>{booking.barco.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Localização</span>
              <span>
                {booking.barco.localizacao.cidade}, {booking.barco.localizacao.estado}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período</span>
              <span>
                {format(new Date(booking.data_inicio), "d 'de' MMMM", {
                  locale: ptBR,
                })}{' '}
                até{' '}
                {format(new Date(booking.data_fim), "d 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium">Detalhes do Pagamento</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data do pagamento</span>
              <span>
                {format(new Date(payment.data_confirmacao || payment.data_criacao), "d 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID da transação</span>
              <span className="font-mono text-xs">
                {payment.stripe_payment_intent_id}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Valor total</span>
              <span>{preco}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>Este é um documento fiscal válido.</p>
        <p className="mt-1">
          Em caso de dúvidas, entre em contato com nosso suporte.
        </p>
      </div>
    </Card>
  );
}; 