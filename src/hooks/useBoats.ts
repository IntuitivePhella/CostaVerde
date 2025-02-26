import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BoatFormData, BoatSummary, BoatUpdateData } from '@/types/boat';

interface UseBoatsParams {
  boat_type?: string;
  location?: string;
  min_capacity?: number;
  max_daily_rate?: number;
  sort_by?: 'daily_rate_asc' | 'daily_rate_desc' | 'newest';
  status?: 'active' | 'inactive' | 'maintenance';
}

interface BoatsResponse {
  boats: BoatSummary[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 12;
const STALE_TIME = 1000 * 60 * 5; // 5 minutos

export const useBoats = ({
  boat_type,
  location,
  min_capacity,
  max_daily_rate,
  sort_by = 'newest',
  status = 'active',
}: UseBoatsParams = {}) => {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const boatsQuery = useInfiniteQuery<BoatsResponse, Error, BoatsResponse, (string | UseBoatsParams)[], number>({
    queryKey: ['boats', { boat_type, location, min_capacity, max_daily_rate, sort_by, status }],
    queryFn: async ({ pageParam }) => {
      // Primeiro, tenta buscar do cache
      const cachedData = queryClient.getQueryData<BoatsResponse>(['boats', { boat_type, location, min_capacity, max_daily_rate, sort_by, status }]);
      if (cachedData) {
        return cachedData;
      }

      // Construindo a query base com select otimizado
      let query = supabase
        .from('boats')
        .select('id, name, boat_type, capacity, daily_rate, location, main_image_url, status, gallery_urls', { count: 'exact' })
        .eq('status', status)
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      // Aplicando filtros de forma otimizada
      if (boat_type) {
        query = query.eq('boat_type', boat_type);
      }

      if (location) {
        // Usando índice trigram para busca de texto mais eficiente
        query = query.ilike('location', `%${location}%`);
      }

      if (min_capacity) {
        query = query.gte('capacity', min_capacity);
      }

      if (max_daily_rate) {
        query = query.lte('daily_rate', max_daily_rate);
      }

      // Otimizando ordenação com índices apropriados
      switch (sort_by) {
        case 'daily_rate_asc':
          query = query.order('daily_rate', { ascending: true });
          break;
        case 'daily_rate_desc':
          query = query.order('daily_rate', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        boats: data as BoatSummary[],
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.totalCount / ITEMS_PER_PAGE);
      const nextPage = allPages.length;
      return nextPage < totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
    gcTime: 1000 * 60 * 30, // 30 minutos
  });

  const createBoat = useMutation({
    mutationFn: async (newBoat: BoatFormData) => {
      const { data, error } = await supabase
        .from('boats')
        .insert([newBoat])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidando apenas as queries afetadas
      queryClient.invalidateQueries({ 
        queryKey: ['boats'],
        refetchType: 'active',
      });
    },
  });

  const updateBoat = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BoatUpdateData }) => {
      const { data: updatedBoat, error } = await supabase
        .from('boats')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedBoat;
    },
    onSuccess: (data) => {
      // Atualizando o cache otimisticamente
      queryClient.setQueryData(['boats'], (oldData: BoatsResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          boats: oldData.boats.map((boat) =>
            boat.id === data.id ? { ...boat, ...data } : boat
          ),
        };
      });
    },
  });

  const deleteBoat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      // Atualizando o cache otimisticamente
      queryClient.setQueryData(['boats'], (oldData: BoatsResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          boats: oldData.boats.filter((boat) => boat.id !== id),
        };
      });
    },
  });

  return {
    ...boatsQuery,
    createBoat,
    updateBoat,
    deleteBoat,
  };
}; 