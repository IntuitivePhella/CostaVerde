import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Reservation = Database['public']['Tables']['reservations']['Row']
type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

interface UseReservationReturn {
  loading: boolean
  createReservation: (data: Omit<ReservationInsert, 'id' | 'created_at' | 'user_id' | 'status' | 'payment_status'>) => Promise<void>
  cancelReservation: (reservationId: string) => Promise<void>
  getUserReservations: () => Promise<Reservation[]>
  getBoatReservations: (boatId: string) => Promise<Reservation[]>
}

export function useReservation(): UseReservationReturn {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const createReservation = async (data: Omit<ReservationInsert, 'id' | 'created_at' | 'user_id' | 'status' | 'payment_status'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      // Verificar disponibilidade
      const { data: isAvailable } = await supabase
        .rpc('check_boat_availability', {
          p_boat_id: data.boat_id,
          p_start_date: data.start_date,
          p_end_date: data.end_date,
        })

      if (!isAvailable) {
        throw new Error('Embarcação não disponível para o período selecionado')
      }

      // Criar reserva
      const { error } = await supabase
        .from('reservations')
        .insert({
          ...data,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
        })

      if (error) throw error

      toast({
        title: 'Reserva criada com sucesso!',
        description: 'Aguarde a confirmação do proprietário.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar reserva',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const cancelReservation = async (reservationId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
        })
        .eq('id', reservationId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Reserva cancelada com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar reserva',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserReservations = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          boat:boats (
            name,
            images,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar reservas',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getBoatReservations = async (boatId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          user:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('boat_id', boatId)
        .order('start_date', { ascending: true })

      if (error) throw error

      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar reservas',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createReservation,
    cancelReservation,
    getUserReservations,
    getBoatReservations,
  }
} 