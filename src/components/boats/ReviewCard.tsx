import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    cleanliness_rating: number;
    communication_rating: number;
    accuracy_rating: number;
    value_rating: number;
    comment: string;
    created_at: string;
    user: {
      full_name: string;
      avatar_url: string | null;
    };
    media: Array<{
      id: string;
      url: string;
      type: 'image' | 'video';
    }>;
  };
  onDelete?: () => void;
  onEdit?: () => void;
  canModify?: boolean;
  className?: string;
}

export const ReviewCard = ({
  review,
  onDelete,
  onEdit,
  canModify = false,
  className,
}: ReviewCardProps) => {
  const criteriaLabels = {
    cleanliness_rating: 'Limpeza',
    communication_rating: 'Comunicação',
    accuracy_rating: 'Precisão',
    value_rating: 'Custo-Benefício',
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="space-y-4 p-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user.avatar_url || undefined} />
              <AvatarFallback>{getInitials(review.user.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{review.user.full_name}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{review.rating.toFixed(1)}</span>
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* Avaliações por critério */}
        <div className="grid gap-2 md:grid-cols-2">
          {(Object.entries(criteriaLabels) as [keyof typeof review, string][]).map(
            ([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={cn('h-4 w-4', {
                        'fill-yellow-400 text-yellow-400':
                          value <= review[key],
                        'fill-gray-200 text-gray-200':
                          value > review[key],
                      })}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Comentário */}
        {review.comment && (
          <p className="text-sm leading-relaxed">{review.comment}</p>
        )}

        {/* Galeria de mídia */}
        {review.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {review.media.map((media) => (
              <div
                key={media.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Foto da avaliação"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Ações */}
      {canModify && (
        <CardFooter className="flex justify-end gap-2 border-t bg-muted/50 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Excluir
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 