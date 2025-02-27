import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PaymentStatus } from './PaymentStatus';
import type { Payment } from '@/types/payment';

interface PaymentHistoryProps {
  payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Histórico de Pagamentos</h2>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Reserva #{payment.booking_id.slice(0, 8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(payment.created_at),
                    "d 'de' MMMM 'de' yyyy",
                    { locale: ptBR }
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: payment.currency,
                  }).format(payment.amount)}
                </p>
                <div className="mt-1">
                  <PaymentStatus status={payment.status} />
                </div>
              </div>
            </div>

            {payment.error_message && (
              <p className="mt-2 text-sm text-red-500">
                Erro: {payment.error_message}
              </p>
            )}
          </Card>
        ))}

        {payments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum pagamento encontrado.
          </p>
        )}
      </div>
    </div>
  );
}; 