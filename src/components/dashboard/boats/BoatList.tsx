"use client"

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditBoatDialog } from './EditBoatDialog';
import { DeleteBoatDialog } from './DeleteBoatDialog';

const boats = [
  {
    id: '1',
    name: 'Mar Azul',
    type: 'sailboat',
    typeName: 'Veleiro',
    status: 'active',
    statusName: 'Ativo',
    length: '42',
    capacity: 8,
    location: 'Marina de Angra dos Reis',
    pricePerDay: 1200,
    images: ['/boats/mar-azul-1.jpg'],
  },
  {
    id: '2',
    name: 'Brisa do Mar',
    type: 'motorboat',
    typeName: 'Lancha',
    status: 'maintenance',
    statusName: 'Em Manutenção',
    length: '38',
    capacity: 12,
    location: 'Marina de Paraty',
    pricePerDay: 1500,
    images: ['/boats/brisa-do-mar-1.jpg'],
  },
  {
    id: '3',
    name: 'Vento Norte',
    type: 'yacht',
    typeName: 'Iate',
    status: 'active',
    statusName: 'Ativo',
    length: '55',
    capacity: 15,
    location: 'Marina de Angra dos Reis',
    pricePerDay: 3000,
    images: ['/boats/vento-norte-1.jpg'],
  },
];

const statusStyles = {
  active: 'bg-green-500',
  maintenance: 'bg-yellow-500',
  inactive: 'bg-red-500',
} as const;

export function BoatList() {
  const [editingBoat, setEditingBoat] = useState<typeof boats[0] | null>(null);
  const [deletingBoat, setDeletingBoat] = useState<typeof boats[0] | null>(null);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {boats.map((boat) => (
          <Card key={boat.id}>
            <CardHeader className="relative">
              <div className="absolute right-6 top-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBoat(boat)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingBoat(boat)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={boat.images[0]}
                  alt={boat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardTitle className="mt-4">{boat.name}</CardTitle>
              <CardDescription>{boat.typeName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={statusStyles[boat.status as keyof typeof statusStyles]}
                  >
                    {boat.statusName}
                  </Badge>
                  <span className="text-sm font-medium">
                    R$ {boat.pricePerDay.toLocaleString('pt-BR')}/dia
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Comprimento</span>
                    <span>{boat.length} pés</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capacidade</span>
                    <span>{boat.capacity} pessoas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Localização</span>
                    <span>{boat.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditBoatDialog
        boat={editingBoat}
        open={!!editingBoat}
        onOpenChange={(open) => !open && setEditingBoat(null)}
      />

      <DeleteBoatDialog
        boat={deletingBoat}
        open={!!deletingBoat}
        onOpenChange={(open) => !open && setDeletingBoat(null)}
      />
    </>
  );
} 