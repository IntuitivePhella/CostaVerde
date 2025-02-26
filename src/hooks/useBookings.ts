import { useMutation, useQuery } from '@tanstack/react-query';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type {
  Booking,
  BookingAvailability,
  CreateBookingData,
} from '@/types/booking';

export const useBookings = (barcoId: string) => {
  // Busca todas as reservas do barco
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery<Booking[]>({
    queryKey: ['bookings', barcoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('barco_id', barcoId)
        .in('status', ['pendente', 'confirmada'])
        .gte('data_fim', format(new Date(), 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
  });

  // Verifica a disponibilidade para as datas selecionadas
  const checkAvailability = async ({
    data_inicio,
    data_fim,
  }: Omit<CreateBookingData, 'barco_id'>): Promise<BookingAvailability> => {
    if (!bookings) return { available: false };

    const selectedStart = parseISO(data_inicio);
    const selectedEnd = parseISO(data_fim);

    // Encontra reservas que conflitam com o período selecionado
    const conflictingBookings = bookings.filter((booking) => {
      const bookingStart = parseISO(booking.data_inicio);
      const bookingEnd = parseISO(booking.data_fim);

      return (
        isWithinInterval(selectedStart, {
          start: bookingStart,
          end: bookingEnd,
        }) ||
        isWithinInterval(selectedEnd, {
          start: bookingStart,
          end: bookingEnd,
        }) ||
        isWithinInterval(bookingStart, {
          start: selectedStart,
          end: selectedEnd,
        })
      );
    });

    if (conflictingBookings.length > 0) {
      return {
        available: false,
        conflicting_dates: conflictingBookings.map((booking) => ({
          data_inicio: booking.data_inicio,
          data_fim: booking.data_fim,
        })),
      };
    }

    // Calcula o preço total
    const { data: barco } = await supabase
      .from('boats')
      .select('preco_dia')
      .eq('id', barcoId)
      .single();

    if (!barco) return { available: false };

    const days = Math.ceil(
      (selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      available: true,
      preco_total: barco.preco_dia * days,
    };
  };

  // Cria uma nova reserva
  const createBooking = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const availability = await checkAvailability(data);

      if (!availability.available || !availability.preco_total) {
        throw new Error('Datas indisponíveis');
      }

      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session.session) {
        throw new Error('Usuário não autenticado');
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          barco_id: data.barco_id,
          usuario_id: session.session.user.id,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          preco_total: availability.preco_total,
          status: 'pendente',
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
  });

  // Retorna as próximas datas disponíveis
  const getNextAvailableDates = async (
    startDate: Date = new Date()
  ): Promise<Date[]> => {
    const availableDates: Date[] = [];
    let currentDate = startDate;

    while (availableDates.length < 7) {
      const isAvailable = await checkAvailability({
        data_inicio: format(currentDate, 'yyyy-MM-dd'),
        data_fim: format(addDays(currentDate, 1), 'yyyy-MM-dd'),
      });

      if (isAvailable.available) {
        availableDates.push(currentDate);
      }

      currentDate = addDays(currentDate, 1);
    }

    return availableDates;
  };

  return {
    bookings,
    isLoading,
    error,
    checkAvailability,
    createBooking,
    getNextAvailableDates,
  };
}; 