import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { usePWA } from './usePWA';

interface Booking {
  id: string;
  boat_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface CreateBookingData {
  boat_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}

export const useOfflineBookings = (userId: string) => {
  const { isOnline } = usePWA();
  const queryClient = useQueryClient();
  const [offlineBookings, setOfflineBookings] = useState<Booking[]>([]);

  // Carregar reservas do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem(`offline_bookings_${userId}`);
    if (stored) {
      setOfflineBookings(JSON.parse(stored));
    }
  }, [userId]);

  // Salvar reservas no localStorage quando mudar
  useEffect(() => {
    if (offlineBookings.length > 0) {
      localStorage.setItem(
        `offline_bookings_${userId}`,
        JSON.stringify(offlineBookings)
      );
    }
  }, [offlineBookings, userId]);

  // Query para buscar reservas
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      if (!isOnline) {
        return offlineBookings;
      }

      const response = await fetch(`/api/bookings?userId=${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar reservas');
      return response.json();
    },
    enabled: !!userId,
  });

  // Mutation para criar reserva
  const { mutate: createBooking } = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      if (!isOnline) {
        const offlineBooking: Booking = {
          id: `offline_${Date.now()}`,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString(),
          ...data,
        };

        setOfflineBookings(prev => [...prev, offlineBooking]);
        return offlineBooking;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) throw new Error('Erro ao criar reserva');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', userId] });
      toast({
        title: 'Reserva criada',
        description: 'Sua reserva foi criada com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a reserva.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para cancelar reserva
  const { mutate: cancelBooking } = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!isOnline) {
        setOfflineBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao cancelar reserva');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', userId] });
      toast({
        title: 'Reserva cancelada',
        description: 'Sua reserva foi cancelada com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a reserva.',
        variant: 'destructive',
      });
    },
  });

  // Sincronizar reservas offline quando voltar online
  useEffect(() => {
    if (isOnline && offlineBookings.length > 0) {
      Promise.all(
        offlineBookings
          .filter(booking => booking.id.startsWith('offline_'))
          .map(async (booking) => {
            try {
              const { id, created_at, ...bookingData } = booking;
              await createBooking(bookingData);
            } catch (error) {
              console.error('Erro ao sincronizar reserva:', error);
            }
          })
      ).then(() => {
        setOfflineBookings([]);
        localStorage.removeItem(`offline_bookings_${userId}`);
      });
    }
  }, [isOnline, offlineBookings, userId]);

  return {
    bookings,
    isLoading,
    createBooking,
    cancelBooking,
    hasOfflineBookings: offlineBookings.length > 0,
  };
}; 