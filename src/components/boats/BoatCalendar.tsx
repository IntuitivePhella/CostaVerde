'use client';

import { useEffect, useState } from 'react';
import { addDays, format, isSameDay, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { useBookings } from '@/hooks/useBookings';
import type { BookingAvailability } from '@/types/booking';

interface BoatCalendarProps {
  barcoId: string;
  onDatesSelected?: (dates: { data_inicio: string; data_fim: string }) => void;
}

export const BoatCalendar = ({ barcoId, onDatesSelected }: BoatCalendarProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [availability, setAvailability] = useState<BookingAvailability>();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const { bookings, checkAvailability } = useBookings(barcoId);
  const { toast } = useToast();

  // Verifica a disponibilidade quando as datas são selecionadas
  useEffect(() => {
    const checkDates = async () => {
      if (startDate && endDate) {
        setIsCheckingAvailability(true);
        try {
          const result = await checkAvailability({
            data_inicio: format(startDate, 'yyyy-MM-dd'),
            data_fim: format(endDate, 'yyyy-MM-dd'),
          });
          setAvailability(result);

          if (result.available && onDatesSelected) {
            onDatesSelected({
              data_inicio: format(startDate, 'yyyy-MM-dd'),
              data_fim: format(endDate, 'yyyy-MM-dd'),
            });
          } else if (!result.available) {
            toast({
              title: 'Datas indisponíveis',
              description: 'Por favor, selecione outras datas.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          toast({
            title: 'Erro ao verificar disponibilidade',
            description: 'Tente novamente mais tarde.',
            variant: 'destructive',
          });
        } finally {
          setIsCheckingAvailability(false);
        }
      } else {
        setAvailability(undefined);
      }
    };

    checkDates();
  }, [startDate, endDate, checkAvailability, onDatesSelected, toast]);

  // Verifica se uma data está indisponível
  const isDateUnavailable = (date: Date) => {
    if (!bookings) return false;

    return bookings.some((booking) => {
      const bookingStart = parseISO(booking.data_inicio);
      const bookingEnd = parseISO(booking.data_fim);

      return (
        date >= bookingStart &&
        date <= bookingEnd &&
        booking.status !== 'cancelada'
      );
    });
  };

  const today = startOfToday();

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[240px] justify-start text-left font-normal ${
                !startDate && 'text-muted-foreground'
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, "d 'de' MMMM", { locale: ptBR })
              ) : (
                <span>Data de início</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date);
                if (date && (!endDate || date > endDate)) {
                  setEndDate(addDays(date, 1));
                }
              }}
              disabled={(date) =>
                date < today || isDateUnavailable(date)
              }
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[240px] justify-start text-left font-normal ${
                !endDate && 'text-muted-foreground'
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, "d 'de' MMMM", { locale: ptBR })
              ) : (
                <span>Data de fim</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) =>
                date < (startDate || today) || isDateUnavailable(date)
              }
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {isCheckingAvailability && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando disponibilidade...
        </div>
      )}

      {availability && !isCheckingAvailability && (
        <div
          className={`text-sm ${
            availability.available ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {availability.available ? (
            <div className="flex flex-col gap-1">
              <span className="font-medium">Datas disponíveis!</span>
              <span>
                Valor total:{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(availability.preco_total || 0)}
              </span>
            </div>
          ) : (
            <span className="font-medium">
              Datas indisponíveis. Por favor, selecione outras datas.
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 