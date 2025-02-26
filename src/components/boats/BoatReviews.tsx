'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewResponse } from './ReviewResponse';
import { ReviewFilters } from './ReviewFilters';
import { cn } from '@/lib/utils';

interface BoatReviewsProps {
  boatId: string;
  ownerId: string;
  className?: string;
}

export const BoatReviews = ({ boatId, ownerId, className }: BoatReviewsProps) => {
  const [filters, setFilters] = useState({
    sortBy: 'recent' as const,
    minRating: 1,
    maxRating: 5,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useReviews({
    boatId,
    sortBy: filters.sortBy,
    filterBy: {
      minRating: filters.minRating,
      maxRating: filters.maxRating,
      hasResponse: filters.hasResponse,
    },
  });

  const { user } = useAuth();
  const isOwner = user?.id === ownerId;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.pages[0]) {
    return (
      <div className="text-center text-muted-foreground">
        Nenhuma avaliação encontrada.
      </div>
    );
  }

  const { reviews, totalCount, averageRating, ratingDistribution } = data.pages[0];

  const getRatingPercentage = (rating: number) => {
    const count = ratingDistribution[rating] || 0;
    return ((count / totalCount) * 100).toFixed(0);
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <ReviewFilters
          onFiltersChange={(newFilters) => {
            setFilters({
              ...filters,
              ...newFilters,
            });
          }}
        />
      </div>

      <div className="mb-6">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-12 text-sm">{rating} estrelas</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className="w-12 text-sm text-muted-foreground">
                {getRatingPercentage(rating)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {data.pages.map((page, i) => (
          <div key={i} className="space-y-6">
            {page.reviews.map((review) => (
              <div key={review.id} className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.user.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{review.user.full_name}</h4>
                      <time className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>

                    {review.response && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 text-sm font-medium">
                          Resposta do proprietário
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.response}
                        </p>
                        {review.response_date && (
                          <time className="mt-1 block text-xs text-muted-foreground">
                            {format(
                              new Date(review.response_date),
                              "d 'de' MMMM 'de' yyyy",
                              { locale: ptBR }
                            )}
                          </time>
                        )}
                      </div>
                    )}

                    {isOwner && !review.response && (
                      <div className="mt-4">
                        <ReviewResponse
                          reviewId={review.id}
                          boatId={boatId}
                          existingResponse={review.response}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Carregando mais avaliações...'
              : 'Carregar mais avaliações'}
          </Button>
        )}
      </div>
    </div>
  );
}; 