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
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { usePayment } from '@/hooks/usePayment';
import type { PaymentDetails } from '@/types/payment';
import { Separator } from '../ui/separator';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormContentProps {
  paymentDetails: PaymentDetails;
}

const PaymentFormContent = ({ paymentDetails }: PaymentFormContentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const { confirmPayment } = usePayment(paymentDetails.booking.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      const { error: cardError, paymentMethod } = await stripe.createPaymentMethod({
        element: cardElement,
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
        variant: 'default',
      });

      router.push('/reservas');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao processar seu pagamento.';
      setCardError(errorMessage);
      toast({
        title: 'Erro no pagamento',
        description: errorMessage,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Detalhes da Reserva</h2>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Embarcação</span>
                <span className="font-medium text-foreground">
                  {paymentDetails.booking.barco.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Localização</span>
                <span className="font-medium text-foreground">
                  {paymentDetails.booking.barco.localizacao.cidade},{' '}
                  {paymentDetails.booking.barco.localizacao.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Período</span>
                <span className="font-medium text-foreground">
                  {format(
                    new Date(paymentDetails.booking.data_inicio),
                    "d 'de' MMMM",
                    { locale: ptBR }
                  )}{' '}
                  até{' '}
                  {format(new Date(paymentDetails.booking.data_fim), "d 'de' MMMM", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Resumo do Pagamento</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valor da reserva</span>
                <span>{preco}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxa de serviço</span>
                <span>Grátis</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{preco}</span>
              </div>
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

          {cardError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro no pagamento</AlertTitle>
              <AlertDescription>{cardError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#00adef] hover:bg-[#1322ad]"
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

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Pagamento processado de forma segura pela Stripe</p>
            <p className="mt-1">
              Seus dados estão protegidos com criptografia de ponta a ponta
            </p>
          </div>
        </div>
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