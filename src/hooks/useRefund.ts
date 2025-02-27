'use client';

import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

interface RefundParams {
  paymentId: string;
  reason?: string;
}

export const useRefund = () => {
  const { toast } = useToast();

  const requestRefund = useMutation({
    mutationFn: async ({ paymentId, reason }: RefundParams) => {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao solicitar reembolso');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reembolso solicitado com sucesso',
        description: 'Você receberá um e-mail com mais informações.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao solicitar reembolso',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  return {
    requestRefund,
  };
}; 