'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const boatSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  type: z.string().min(1, 'Selecione um tipo de embarcação'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  capacity: z.coerce
    .number()
    .min(1, 'Capacidade deve ser maior que 0')
    .max(100, 'Capacidade máxima é 100'),
  price_per_day: z.coerce
    .number()
    .min(1, 'Preço deve ser maior que 0'),
  location: z.string().min(3, 'Localização é obrigatória'),
  is_active: z.boolean().default(true),
});

type BoatForm = z.infer<typeof boatSchema>;

const boatTypes = [
  'Lancha',
  'Veleiro',
  'Iate',
  'Catamarã',
  'Jet Ski',
  'Barco de Pesca',
  'Escuna',
  'Outro',
];

export default function EditBoatPage({
  params,
}: {
  params: { id: string };
}) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<BoatForm>({
    resolver: zodResolver(boatSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      capacity: 1,
      price_per_day: 0,
      location: '',
      is_active: true,
    },
  });

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        const { data: boat, error } = await supabase
          .from('boats')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (boat.owner_id !== user?.id) {
          router.push('/barcos');
          return;
        }

        form.reset({
          name: boat.name,
          type: boat.type,
          description: boat.description,
          capacity: boat.capacity,
          price_per_day: boat.price_per_day,
          location: boat.location,
          is_active: boat.is_active,
        });
      } catch (error) {
        setError('Erro ao carregar embarcação.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoat();
  }, [supabase, params.id, user?.id, form, router]);

  const onSubmit = async (data: BoatForm) => {
    try {
      const { error } = await supabase
        .from('boats')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;

      setSuccess('Embarcação atualizada com sucesso!');
      setError('');
    } catch (error) {
      setError('Erro ao atualizar embarcação. Tente novamente.');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Editar Embarcação</h2>
        <p className="text-muted-foreground">
          Atualize as informações da sua embarcação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Embarcação</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Embarcação</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da embarcação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Embarcação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boatTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade (pessoas)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_per_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço por dia (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade, Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva sua embarcação..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Disponível para aluguel
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Sua embarcação estará visível para reservas
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 