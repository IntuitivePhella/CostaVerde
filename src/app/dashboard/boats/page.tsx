"use client"

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoatList } from '@/components/dashboard/boats/BoatList';
import { BoatFilters } from '@/components/dashboard/boats/BoatFilters';
import { CreateBoatDialog } from '@/components/dashboard/boats/CreateBoatDialog';

export default function BoatsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embarcações</h1>
          <p className="text-muted-foreground">
            Gerencie suas embarcações e disponibilidade
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Embarcação
        </Button>
      </div>

      <BoatFilters />
      <BoatList />
      
      <CreateBoatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
} 