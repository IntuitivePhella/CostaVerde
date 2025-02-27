import { CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentStatusProps {
  status: 'pendente' | 'confirmado' | 'falhou' | 'reembolsado';
  className?: string;
}

export const PaymentStatus = ({ status, className }: PaymentStatusProps) => {
  const statusConfig = {
    pendente: {
      icon: RefreshCcw,
      text: 'Pendente',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    confirmado: {
      icon: CheckCircle2,
      text: 'Confirmado',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    falhou: {
      icon: XCircle,
      text: 'Falhou',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    reembolsado: {
      icon: AlertCircle,
      text: 'Reembolsado',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1',
        config.bgColor,
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      <span className={cn('text-xs font-medium', config.color)}>
        {config.text}
      </span>
    </div>
  );
}; 