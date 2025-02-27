import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
  boat: {
    name: string;
  };
  media: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
  }>;
}

interface UseReviewModerationParams {
  status?: 'pending' | 'approved' | 'rejected';
}

export const useReviewModeration = ({ status }: UseReviewModerationParams = {}) => {
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar avaliações para moderação
  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['reviews', 'moderation', status],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          user:profiles(
            full_name,
            email
          ),
          boat:boats(
            name
          ),
          media:review_media(
            id,
            url,
            type
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Review[];
    },
    staleTime: 1000 * 60, // 1 minuto
  });

  // Aprovar uma avaliação
  const approveReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'moderation'],
      });
      toast({
        title: 'Avaliação aprovada',
        description: 'A avaliação foi aprovada e está visível para todos os usuários.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao aprovar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Rejeitar uma avaliação
  const rejectReview = useMutation({
    mutationFn: async ({
      reviewId,
      reason,
    }: {
      reviewId: string;
      reason: string;
    }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', reviewId);

      if (error) throw error;

      // Enviar notificação ao usuário (implementar depois)
      // await notifyUser(reviewId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'moderation'],
      });
      toast({
        title: 'Avaliação rejeitada',
        description: 'A avaliação foi rejeitada e o usuário será notificado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao rejeitar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Verificar conteúdo impróprio
  const checkInappropriateContent = async (text: string): Promise<boolean> => {
    // Implementar integração com API de moderação de conteúdo
    // Por exemplo: Azure Content Moderator, Amazon Comprehend, etc.
    // Por enquanto, usando uma verificação básica
    const inappropriateWords = [
      'palavrão',
      'ofensa',
      // Adicionar mais palavras conforme necessário
    ];

    return inappropriateWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  // Verificar imagem imprópria
  const checkInappropriateImage = async (imageUrl: string): Promise<boolean> => {
    // Implementar integração com API de moderação de imagens
    // Por exemplo: Azure Computer Vision, Amazon Rekognition, etc.
    return false; // Por enquanto, retornando false
  };

  return {
    reviews,
    isLoading,
    error,
    approveReview,
    rejectReview,
    checkInappropriateContent,
    checkInappropriateImage,
  };
}; 