import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';
import type { ReviewFormData } from '@/lib/validations';

interface UseReviewsParams {
  boatId?: string;
  userId?: string;
  sortBy?: 'recent' | 'rating_high' | 'rating_low';
  filterBy?: {
    minRating?: number;
    maxRating?: number;
    hasResponse?: boolean;
  };
}

interface Review extends Database['public']['Tables']['reviews']['Row'] {
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  booking: {
    start_date: string;
    end_date: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

const ITEMS_PER_PAGE = 10;
const STALE_TIME = 1000 * 60 * 5; // 5 minutos

export const useReviews = ({
  boatId,
  userId,
  sortBy = 'recent',
  filterBy = {},
}: UseReviewsParams = {}) => {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reviewsQuery = useInfiniteQuery<ReviewsResponse, Error>({
    queryKey: ['reviews', { boatId, userId, sortBy, filterBy }],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(
            id,
            full_name,
            avatar_url
          ),
          booking:bookings(
            start_date,
            end_date
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (boatId) {
        query = query.eq('boat_id', boatId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filterBy.minRating) {
        query = query.gte('rating', filterBy.minRating);
      }

      if (filterBy.maxRating) {
        query = query.lte('rating', filterBy.maxRating);
      }

      if (filterBy.hasResponse !== undefined) {
        if (filterBy.hasResponse) {
          query = query.not('response', 'is', null);
        } else {
          query = query.is('response', null);
        }
      }

      // Aplicar ordenação
      switch (sortBy) {
        case 'rating_high':
          query = query.order('rating', { ascending: false });
          break;
        case 'rating_low':
          query = query.order('rating', { ascending: true });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Aplicar paginação
      query = query.range(
        pageParam * ITEMS_PER_PAGE,
        (pageParam + 1) * ITEMS_PER_PAGE - 1
      );

      const { data, error, count } = await query;

      if (error) throw error;

      // Calcular distribuição de avaliações
      const ratingDistribution = (data as Review[]).reduce(
        (acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        },
        {} as { [key: number]: number }
      );

      // Calcular média de avaliações
      const averageRating =
        data.reduce((acc, review) => acc + review.rating, 0) / (data.length || 1);

      return {
        reviews: data as Review[],
        totalCount: count || 0,
        averageRating,
        ratingDistribution,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.totalCount / ITEMS_PER_PAGE);
      const nextPage = allPages.length;
      return nextPage < totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
  });

  const createReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        refetchType: 'active',
      });
      toast({
        title: 'Avaliação enviada',
        description: 'Sua avaliação foi publicada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ReviewFormData>;
    }) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['reviews'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.map((review: Review) =>
            review.id === data.id ? { ...review, ...data } : review
          ),
        };
      });
      toast({
        title: 'Avaliação atualizada',
        description: 'Sua avaliação foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['reviews'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.filter((review: Review) => review.id !== id),
        };
      });
      toast({
        title: 'Avaliação removida',
        description: 'Sua avaliação foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const respondToReview = useMutation({
    mutationFn: async ({
      id,
      response,
    }: {
      id: string;
      response: string;
    }) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          response,
          response_date: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['reviews'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.map((review: Review) =>
            review.id === data.id ? { ...review, ...data } : review
          ),
        };
      });
      toast({
        title: 'Resposta enviada',
        description: 'Sua resposta foi publicada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar resposta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    ...reviewsQuery,
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
  };
}; 