'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Boat = Database['public']['Tables']['boats']['Row'];

export default function BoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const { data, error } = await supabase
          .from('boats')
          .select('*')
          .eq('owner_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBoats(data || []);
      } catch (error) {
        setError('Erro ao carregar embarcações.');
      }
    };

    fetchBoats();
  }, [supabase, user?.id]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBoats(boats.filter(boat => boat.id !== id));
    } catch (error) {
      setError('Erro ao excluir embarcação.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Embarcações</h2>
          <p className="text-muted-foreground">
            Gerencie suas embarcações cadastradas
          </p>
        </div>

        <Button asChild>
          <Link href="/barcos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Nova Embarcação
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Preço (dia)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boats.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-24"
                >
                  Nenhuma embarcação cadastrada
                </TableCell>
              </TableRow>
            ) : (
              boats.map((boat) => (
                <TableRow key={boat.id}>
                  <TableCell className="font-medium">{boat.name}</TableCell>
                  <TableCell>{boat.type}</TableCell>
                  <TableCell>{boat.capacity} pessoas</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(boat.price_per_day)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        boat.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {boat.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/barcos/${boat.id}/editar`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(boat.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 