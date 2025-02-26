'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { usePayment } from '@/hooks/usePayment';
import type { PaymentDetails } from '@/types/payment';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormContentProps {
  paymentDetails: PaymentDetails;
}

const PaymentFormContent = ({ paymentDetails }: PaymentFormContentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const { confirmPayment } = usePayment(paymentDetails.booking.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: cardError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement)!,
        });

      if (cardError) {
        throw new Error(cardError.message);
      }

      await confirmPayment.mutateAsync({
        paymentIntentId: paymentDetails.payment.stripe_payment_intent_id,
        paymentMethodId: paymentMethod.id,
      });

      toast({
        title: 'Pagamento realizado com sucesso!',
        description: 'Sua reserva foi confirmada.',
      });

      router.push('/reservas');
    } catch (error) {
      toast({
        title: 'Erro no pagamento',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao processar seu pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const preco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(paymentDetails.booking.preco_total);

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold">Detalhes da Reserva</h2>
          <div className="text-sm text-muted-foreground">
            <p>
              {paymentDetails.booking.barco.nome} em{' '}
              {paymentDetails.booking.barco.localizacao.cidade},{' '}
              {paymentDetails.booking.barco.localizacao.estado}
            </p>
            <p>
              {format(
                new Date(paymentDetails.booking.data_inicio),
                "d 'de' MMMM",
                { locale: ptBR }
              )}{' '}
              até{' '}
              {format(new Date(paymentDetails.booking.data_fim), "d 'de' MMMM", {
                locale: ptBR,
              })}
            </p>
            <p className="mt-2 font-medium text-foreground">
              Valor total: {preco}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Dados do Cartão</h3>
          <div className="rounded-md border p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    '::placeholder': {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6 w-full bg-[#00adef] hover:bg-[#1322ad]"
          disabled={isProcessing || !stripe}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar ${preco}`
          )}
        </Button>
      </Card>
    </form>
  );
};

interface PaymentFormProps {
  paymentDetails: PaymentDetails;
}

export const PaymentForm = ({ paymentDetails }: PaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent paymentDetails={paymentDetails} />
    </Elements>
  );
}; 