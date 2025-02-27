'use client';

import { useState } from 'react';
import { Star, Upload } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface ReviewFormProps {
  boatId: string;
  bookingId: string;
  initialData?: {
    id: string;
    rating: number;
    cleanliness_rating: number;
    communication_rating: number;
    accuracy_rating: number;
    value_rating: number;
    comment: string;
    media: Array<{
      id: string;
      url: string;
      type: 'image' | 'video';
    }>;
  };
  onSuccess?: () => void;
  className?: string;
}

interface RatingCriteriaProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hoveredValue: number;
  onHover: (value: number) => void;
}

const RatingCriteria = ({
  label,
  value,
  onChange,
  hoveredValue,
  onHover,
}: RatingCriteriaProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => onHover(0)}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          className="rounded-md p-1 hover:bg-accent"
          onClick={() => onChange(starValue)}
          onMouseEnter={() => onHover(starValue)}
        >
          <Star
            className={cn('h-5 w-5 transition-colors', {
              'fill-yellow-400 text-yellow-400':
                starValue <= (hoveredValue || value),
              'fill-gray-200 text-gray-200':
                starValue > (hoveredValue || value),
            })}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {value
          ? `${value} ${value === 1 ? 'estrela' : 'estrelas'}`
          : 'Selecione uma classificação'}
      </span>
    </div>
  </div>
);

export const ReviewForm = ({
  boatId,
  bookingId,
  initialData,
  onSuccess,
  className,
}: ReviewFormProps) => {
  const [overallRating, setOverallRating] = useState(initialData?.rating || 0);
  const [cleanlinessRating, setCleanlinessRating] = useState(initialData?.cleanliness_rating || 0);
  const [communicationRating, setCommunicationRating] = useState(initialData?.communication_rating || 0);
  const [accuracyRating, setAccuracyRating] = useState(initialData?.accuracy_rating || 0);
  const [valueRating, setValueRating] = useState(initialData?.value_rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState(initialData?.media || []);

  const { toast } = useToast();
  const { createReview, updateReview } = useReviews({ boatId });
  const { uploadMedia } = useUploadMedia();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      if (!isValid) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, envie apenas imagens ou vídeos.',
          variant: 'destructive',
        });
      }
      if (!isValidSize) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O tamanho máximo permitido é 100MB.',
          variant: 'destructive',
        });
      }
      return isValid && isValidSize;
    });
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0 || cleanlinessRating === 0 || communicationRating === 0 || 
        accuracyRating === 0 || valueRating === 0) {
      toast({
        title: 'Avaliação incompleta',
        description: 'Por favor, avalie todos os critérios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload media files first
      const uploadedFiles = await Promise.all(
        mediaFiles.map(async (file) => {
          const result = await uploadMedia(file, (progress) => {
            setUploadProgress(progress);
          });
          return {
            url: result.url,
            type: file.type.startsWith('image/') ? 'image' : 'video' as const,
          };
        })
      );

      const reviewData = {
        rating: overallRating,
        cleanliness_rating: cleanlinessRating,
        communication_rating: communicationRating,
        accuracy_rating: accuracyRating,
        value_rating: valueRating,
        comment,
        media: [...uploadedMedia, ...uploadedFiles],
      };

      if (initialData) {
        await updateReview.mutateAsync({
          id: initialData.id,
          data: reviewData,
        });
      } else {
        await createReview.mutateAsync({
          booking_id: bookingId,
          ...reviewData,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const isSubmitting = createReview.isPending || updateReview.isPending;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <RatingCriteria
        label="Avaliação Geral"
        value={overallRating}
        onChange={setOverallRating}
        hoveredValue={hoveredRating}
        onHover={setHoveredRating}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RatingCriteria
          label="Limpeza"
          value={cleanlinessRating}
          onChange={setCleanlinessRating}
          hoveredValue={hoveredRating}
          onHover={setHoveredRating}
        />
        <RatingCriteria
          label="Comunicação"
          value={communicationRating}
          onChange={setCommunicationRating}
          hoveredValue={hoveredRating}
          onHover={setHoveredRating}
        />
        <RatingCriteria
          label="Precisão"
          value={accuracyRating}
          onChange={setAccuracyRating}
          hoveredValue={hoveredRating}
          onHover={setHoveredRating}
        />
        <RatingCriteria
          label="Custo-Benefício"
          value={valueRating}
          onChange={setValueRating}
          hoveredValue={hoveredRating}
          onHover={setHoveredRating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Seu comentário</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência com este barco..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Fotos e Vídeos</Label>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {uploadedMedia.map((media, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg bg-muted"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Mídia ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="h-full w-full rounded-lg object-cover"
                    controls
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    setUploadedMedia(prev =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('media-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Adicionar fotos/vídeos
            </Button>
            <input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? 'Salvando...'
          : initialData
          ? 'Atualizar avaliação'
          : 'Enviar avaliação'}
      </Button>
    </form>
  );
}; 