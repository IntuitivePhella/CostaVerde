import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Boat = Database['public']['Tables']['boats']['Row']
type BoatInsert = Database['public']['Tables']['boats']['Insert']
type BoatUpdate = Database['public']['Tables']['boats']['Update']

interface UseBoatReturn {
  loading: boolean
  createBoat: (data: Omit<BoatInsert, 'id' | 'created_at' | 'owner_id' | 'status' | 'rating' | 'reviews_count'>) => Promise<void>
  updateBoat: (id: string, data: BoatUpdate) => Promise<void>
  deleteBoat: (id: string) => Promise<void>
  getBoat: (id: string) => Promise<Boat | null>
  getUserBoats: () => Promise<Boat[]>
  searchBoats: (params: {
    location?: string
    startDate?: string
    endDate?: string
    guests?: number
    boatType?: string
    minPrice?: number
    maxPrice?: number
  }) => Promise<Boat[]>
}

export function useBoat(): UseBoatReturn {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const createBoat = async (data: Omit<BoatInsert, 'id' | 'created_at' | 'owner_id' | 'status' | 'rating' | 'reviews_count'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('boats')
        .insert({
          ...data,
          owner_id: user.id,
          status: 'available',
        })

      if (error) throw error

      toast({
        title: 'Embarcação cadastrada com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar embarcação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateBoat = async (id: string, data: BoatUpdate) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('boats')
        .update(data)
        .eq('id', id)
        .eq('owner_id', user.id)

      if (error) throw error

      toast({
        title: 'Embarcação atualizada com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar embarcação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteBoat = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id)

      if (error) throw error

      toast({
        title: 'Embarcação removida com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover embarcação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getBoat = async (id: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('boats')
        .select(`
          *,
          owner:profiles (
            full_name,
            avatar_url
          ),
          reviews (
            rating,
            comment,
            created_at,
            user:profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar embarcação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserBoats = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar embarcações',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const searchBoats = async (params: {
    location?: string
    startDate?: string
    endDate?: string
    guests?: number
    boatType?: string
    minPrice?: number
    maxPrice?: number
  }) => {
    setLoading(true)
    try {
      let query = supabase
        .from('boats')
        .select('*')
        .eq('status', 'available')

      if (params.location) {
        query = query.ilike('location', `%${params.location}%`)
      }

      if (params.guests) {
        query = query.gte('capacity', params.guests)
      }

      if (params.boatType && params.boatType !== 'all') {
        query = query.eq('type', params.boatType)
      }

      if (params.minPrice) {
        query = query.gte('daily_rate', params.minPrice)
      }

      if (params.maxPrice) {
        query = query.lte('daily_rate', params.maxPrice)
      }

      // Se houver datas selecionadas, verificar disponibilidade
      if (params.startDate && params.endDate) {
        query = query.not('id', 'in', supabase
          .from('reservations')
          .select('boat_id')
          .neq('status', 'cancelled')
          .gte('start_date', params.startDate)
          .lte('end_date', params.endDate)
        )
      }

      const { data, error } = await query

      if (error) throw error

      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar embarcações',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createBoat,
    updateBoat,
    deleteBoat,
    getBoat,
    getUserBoats,
    searchBoats,
  }
} 