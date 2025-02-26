'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ReviewResponseProps {
  reviewId: string;
  boatId: string;
  existingResponse?: string;
  className?: string;
}

export const ReviewResponse = ({
  reviewId,
  boatId,
  existingResponse,
  className,
}: ReviewResponseProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState(existingResponse || '');
  const { respondToReview } = useReviews({ boatId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await respondToReview.mutateAsync({
        id: reviewId,
        response: response.trim(),
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('w-full', className)}
        >
          {existingResponse ? 'Editar resposta' : 'Responder avaliação'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingResponse ? 'Editar resposta' : 'Responder à avaliação'}
          </DialogTitle>
          <DialogDescription>
            Sua resposta será exibida publicamente abaixo da avaliação do cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="response" className="text-sm font-medium">
              Sua resposta
            </label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Digite sua resposta..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={respondToReview.isPending || !response.trim()}
            >
              {respondToReview.isPending ? 'Salvando...' : 'Salvar resposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 