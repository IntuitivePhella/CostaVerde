'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  boatId: string;
  bookingId: string;
  initialData?: {
    id: string;
    rating: number;
    comment: string;
  };
  onSuccess?: () => void;
  className?: string;
}

export const ReviewForm = ({
  boatId,
  bookingId,
  initialData,
  onSuccess,
  className,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const { createReview, updateReview } = useReviews({ boatId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Avaliação necessária',
        description: 'Por favor, selecione uma classificação de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (initialData) {
        await updateReview.mutateAsync({
          id: initialData.id,
          data: {
            rating,
            comment,
          },
        });
      } else {
        await createReview.mutateAsync({
          booking_id: bookingId,
          rating,
          comment,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const isSubmitting = createReview.isPending || updateReview.isPending;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Sua avaliação</label>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="rounded-md p-1 hover:bg-accent"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
            >
              <Star
                className={cn('h-6 w-6 transition-colors', {
                  'fill-yellow-400 text-yellow-400':
                    value <= (hoveredRating || rating),
                  'fill-gray-200 text-gray-200':
                    value > (hoveredRating || rating),
                })}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating
              ? `${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`
              : 'Selecione uma classificação'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Seu comentário
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência com este barco..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Salvando...'
          : initialData
          ? 'Atualizar avaliação'
          : 'Enviar avaliação'}
      </Button>
    </form>
  );
}; 