import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

interface UseReviewsParams {
  boatId?: string;
  userId?: string;
  sortBy?: 'recent' | 'rating_high' | 'rating_low';
  filterBy?: {
    minRating?: number;
    maxRating?: number;
    hasResponse?: boolean;
    hasMedia?: boolean;
  };
}

interface ReviewMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
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
  media: ReviewMedia[];
}

interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  criteriaAverages: {
    cleanliness: number;
    communication: number;
    accuracy: number;
    value: number;
  };
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ReviewFormData {
  booking_id: string;
  rating: number;
  cleanliness_rating: number;
  communication_rating: number;
  accuracy_rating: number;
  value_rating: number;
  comment: string;
  media: Array<{
    url: string;
    type: 'image' | 'video';
  }>;
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
          ),
          media:review_media(
            id,
            url,
            type
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

      if (filterBy.hasMedia !== undefined) {
        if (filterBy.hasMedia) {
          query = query.not('media', 'is', '[]');
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

      // Calcular médias dos critérios
      const criteriaAverages = (data as Review[]).reduce(
        (acc, review) => {
          acc.cleanliness += review.cleanliness_rating;
          acc.communication += review.communication_rating;
          acc.accuracy += review.accuracy_rating;
          acc.value += review.value_rating;
          return acc;
        },
        { cleanliness: 0, communication: 0, accuracy: 0, value: 0 }
      );

      const reviewCount = data.length || 1;
      Object.keys(criteriaAverages).forEach((key) => {
        criteriaAverages[key as keyof typeof criteriaAverages] /= reviewCount;
      });

      // Calcular distribuição de avaliações
      const ratingDistribution = (data as Review[]).reduce(
        (acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        },
        {} as { [key: number]: number }
      );

      // Calcular média geral
      const averageRating =
        data.reduce((acc, review) => acc + review.rating, 0) / reviewCount;

      return {
        reviews: data as Review[],
        totalCount: count || 0,
        averageRating,
        criteriaAverages,
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
      // Primeiro, criar a review
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([{
          booking_id: data.booking_id,
          rating: data.rating,
          cleanliness_rating: data.cleanliness_rating,
          communication_rating: data.communication_rating,
          accuracy_rating: data.accuracy_rating,
          value_rating: data.value_rating,
          comment: data.comment,
        }])
        .select()
        .single();

      if (error) throw error;

      // Depois, adicionar as mídias
      if (data.media.length > 0) {
        const { error: mediaError } = await supabase
          .from('review_media')
          .insert(
            data.media.map((media) => ({
              review_id: review.id,
              url: media.url,
              type: media.type,
            }))
          );

        if (mediaError) throw mediaError;
      }

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
      // Atualizar a review
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          rating: data.rating,
          cleanliness_rating: data.cleanliness_rating,
          communication_rating: data.communication_rating,
          accuracy_rating: data.accuracy_rating,
          value_rating: data.value_rating,
          comment: data.comment,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar mídias se fornecidas
      if (data.media) {
        // Primeiro, remover todas as mídias existentes
        await supabase
          .from('review_media')
          .delete()
          .eq('review_id', id);

        // Depois, adicionar as novas mídias
        if (data.media.length > 0) {
          const { error: mediaError } = await supabase
            .from('review_media')
            .insert(
              data.media.map((media) => ({
                review_id: id,
                url: media.url,
                type: media.type,
              }))
            );

          if (mediaError) throw mediaError;
        }
      }

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
      // Primeiro, deletar todas as mídias associadas
      await supabase
        .from('review_media')
        .delete()
        .eq('review_id', id);

      // Depois, deletar a review
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

  return {
    reviews: reviewsQuery.data?.pages.flatMap((page) => page.reviews) ?? [],
    totalCount: reviewsQuery.data?.pages[0]?.totalCount ?? 0,
    averageRating: reviewsQuery.data?.pages[0]?.averageRating ?? 0,
    criteriaAverages: reviewsQuery.data?.pages[0]?.criteriaAverages ?? {
      cleanliness: 0,
      communication: 0,
      accuracy: 0,
      value: 0,
    },
    ratingDistribution: reviewsQuery.data?.pages[0]?.ratingDistribution ?? {},
    isLoading: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    error: reviewsQuery.error,
    hasNextPage: reviewsQuery.hasNextPage,
    fetchNextPage: reviewsQuery.fetchNextPage,
    isFetchingNextPage: reviewsQuery.isFetchingNextPage,
    createReview,
    updateReview,
    deleteReview,
  };
}; 