import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  responseRate: number;
  averageResponseTime: number; // em horas
  monthlyTrends: {
    month: string;
    averageRating: number;
    totalReviews: number;
  }[];
}

interface UseReviewStatsParams {
  boatId?: string;
  ownerId?: string;
  timeframe?: 'week' | 'month' | 'year' | 'all';
}

export const useReviewStats = ({
  boatId,
  ownerId,
  timeframe = 'all',
}: UseReviewStatsParams = {}) => {
  const supabase = createClientComponentClient<Database>();

  return useQuery<ReviewStats>({
    queryKey: ['reviewStats', { boatId, ownerId, timeframe }],
    queryFn: async () => {
      let query = supabase.from('reviews').select('*');

      // Aplicar filtros
      if (boatId) {
        query = query.eq('boat_id', boatId);
      }

      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      // Aplicar filtro de tempo
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (timeframe) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data: reviews, error } = await query;

      if (error) throw error;

      // Calcular estatísticas
      const totalReviews = reviews.length;
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

      // Distribuição de avaliações
      const ratingDistribution = reviews.reduce(
        (acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        },
        {} as { [key: number]: number }
      );

      // Taxa de resposta
      const reviewsWithResponse = reviews.filter(
        (review) => review.response !== null
      ).length;
      const responseRate = totalReviews > 0 ? reviewsWithResponse / totalReviews : 0;

      // Tempo médio de resposta
      const responseTimes = reviews
        .filter((review) => review.response_date && review.created_at)
        .map((review) => {
          const responseDate = new Date(review.response_date!);
          const reviewDate = new Date(review.created_at);
          return (responseDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60); // em horas
        });

      const averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0;

      // Tendências mensais
      const monthlyData = reviews.reduce(
        (acc, review) => {
          const date = new Date(review.created_at);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}`;

          if (!acc[monthKey]) {
            acc[monthKey] = {
              ratings: [],
              count: 0,
            };
          }

          acc[monthKey].ratings.push(review.rating);
          acc[monthKey].count++;

          return acc;
        },
        {} as {
          [key: string]: {
            ratings: number[];
            count: number;
          };
        }
      );

      const monthlyTrends = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          averageRating:
            data.ratings.reduce((sum, rating) => sum + rating, 0) /
            data.ratings.length,
          totalReviews: data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
        responseRate,
        averageResponseTime,
        monthlyTrends,
      };
    },
  });
}; 