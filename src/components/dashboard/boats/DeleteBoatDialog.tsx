"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteBoatDialogProps {
  boat: any | null; // TODO: Tipar corretamente
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBoatDialog({
  boat,
  open,
  onOpenChange,
}: DeleteBoatDialogProps) {
  const handleDelete = async () => {
    try {
      // TODO: Implementar exclusão de embarcação
      console.log('Excluindo embarcação:', boat?.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir embarcação:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir esta embarcação?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a
            embarcação &quot;{boat?.name}&quot; e todas as suas informações
            associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 