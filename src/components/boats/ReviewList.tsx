import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { ReviewStats } from './ReviewStats';
import { ReviewForm } from './ReviewForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from '@/hooks/useSession';

interface ReviewListProps {
  boatId: string;
  className?: string;
}

export const ReviewList = ({ boatId, className }: ReviewListProps) => {
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low'>('recent');
  const [filters, setFilters] = useState({
    minRating: 0,
    hasMedia: false,
  });
  const [editingReview, setEditingReview] = useState<string | null>(null);

  const { user } = useSession();
  const {
    reviews,
    totalCount,
    averageRating,
    criteriaAverages,
    ratingDistribution,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    deleteReview,
  } = useReviews({
    boatId,
    sortBy,
    filterBy: {
      minRating: filters.minRating,
      hasMedia: filters.hasMedia,
    },
  });

  const handleSortChange = (value: string) => {
    setSortBy(value as typeof sortBy);
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      await deleteReview.mutateAsync(reviewId);
    }
  };

  return (
    <div className={className}>
      {/* Estatísticas */}
      <ReviewStats
        averageRating={averageRating}
        totalReviews={totalCount}
        criteriaAverages={criteriaAverages}
        ratingDistribution={ratingDistribution}
        className="mb-8"
      />

      {/* Filtros e Ordenação */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="sort">Ordenar por</Label>
          <Select
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sort" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="rating_high">Maior avaliação</SelectItem>
              <SelectItem value="rating_low">Menor avaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="min-rating">Avaliação mínima</Label>
            <Select
              value={filters.minRating.toString()}
              onValueChange={(value) =>
                handleFilterChange('minRating', parseInt(value))
              }
            >
              <SelectTrigger id="min-rating" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todas</SelectItem>
                <SelectItem value="3">3+ estrelas</SelectItem>
                <SelectItem value="4">4+ estrelas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="has-media"
              checked={filters.hasMedia}
              onCheckedChange={(checked) =>
                handleFilterChange('hasMedia', checked)
              }
            />
            <Label htmlFor="has-media">Com fotos/vídeos</Label>
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canModify={user?.id === review.user.id}
            onEdit={() => setEditingReview(review.id)}
            onDelete={() => handleDelete(review.id)}
          />
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

        {!isLoading && reviews.length === 0 && (
          <p className="text-center text-muted-foreground">
            Nenhuma avaliação encontrada com os filtros selecionados.
          </p>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="max-w-2xl">
          {editingReview && (
            <ReviewForm
              boatId={boatId}
              bookingId={reviews.find((r) => r.id === editingReview)?.booking.id || ''}
              initialData={reviews.find((r) => r.id === editingReview)}
              onSuccess={() => setEditingReview(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 