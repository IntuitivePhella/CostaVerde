'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BoatCalendar } from '@/components/boats/BoatCalendar';
import { useBookings } from '@/hooks/useBookings';
import type { BookingAvailability } from '@/types/booking';

interface BoatBookingFormProps {
  barcoId: string;
}

export const BoatBookingForm = ({ barcoId }: BoatBookingFormProps) => {
  const [selectedDates, setSelectedDates] = useState<{
    data_inicio: string;
    data_fim: string;
  }>();
  const [availability, setAvailability] = useState<BookingAvailability>();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { createBooking } = useBookings(barcoId);

  const handleDatesSelected = (dates: {
    data_inicio: string;
    data_fim: string;
  }) => {
    setSelectedDates(dates);
  };

  const handleCreateBooking = async () => {
    if (!selectedDates) return;

    setIsCreatingBooking(true);
    try {
      const booking = await createBooking.mutateAsync({
        barco_id: barcoId,
        ...selectedDates,
      });

      toast({
        title: 'Reserva criada com sucesso!',
        description: 'Você será redirecionado para o pagamento.',
      });

      // Redireciona para a página de pagamento
      router.push(`/reservas/${booking.id}/pagamento`);
    } catch (error) {
      toast({
        title: 'Erro ao criar reserva',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao criar sua reserva. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Reservar este barco</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione as datas desejadas para verificar a disponibilidade
      </p>

      <div className="mt-4">
        <BoatCalendar
          barcoId={barcoId}
          onDatesSelected={(dates) => {
            handleDatesSelected(dates);
            setAvailability({
              available: true,
              preco_total: 0, // Será atualizado pelo BoatCalendar
            });
          }}
        />
      </div>

      {availability?.available && selectedDates && (
        <Button
          className="mt-6 w-full bg-[#00adef] hover:bg-[#1322ad]"
          onClick={handleCreateBooking}
          disabled={isCreatingBooking}
        >
          {isCreatingBooking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando reserva...
            </>
          ) : (
            'Reservar agora'
          )}
        </Button>
      )}
    </Card>
  );
}; 