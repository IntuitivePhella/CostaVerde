import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useReviewModeration } from '@/hooks/useReviewModeration';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReviewModeration = () => {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const [rejectingReview, setRejectingReview] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { reviews, isLoading, approveReview, rejectReview } = useReviewModeration({
    status: selectedTab,
  });

  const handleApprove = async (reviewId: string) => {
    await approveReview.mutateAsync(reviewId);
  };

  const handleReject = async () => {
    if (!rejectingReview || !rejectionReason.trim()) return;

    await rejectReview.mutateAsync({
      reviewId: rejectingReview,
      reason: rejectionReason.trim(),
    });

    setRejectingReview(null);
    setRejectionReason('');
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moderação de Avaliações</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {reviews.length} avaliações
          </span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma avaliação {selectedTab === 'pending'
                ? 'pendente'
                : selectedTab === 'approved'
                ? 'aprovada'
                : 'rejeitada'
              }.
            </p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{review.user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {review.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{review.rating.toFixed(1)}</span>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Barco: {review.boat.name}</span>
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {review.comment && (
                    <p className="text-sm leading-relaxed">{review.comment}</p>
                  )}

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
                              alt="Mídia da avaliação"
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

                  {selectedTab === 'rejected' && review.rejection_reason && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <strong>Motivo da rejeição:</strong> {review.rejection_reason}
                    </div>
                  )}
                </CardContent>

                {selectedTab === 'pending' && (
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setRejectingReview(review.id)}
                    >
                      Rejeitar
                    </Button>
                    <Button onClick={() => handleApprove(review.id)}>
                      Aprovar
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!rejectingReview}
        onOpenChange={() => {
          setRejectingReview(null);
          setRejectionReason('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Avaliação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Descreva o motivo da rejeição..."
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectingReview(null);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 