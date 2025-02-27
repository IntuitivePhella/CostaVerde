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
          router.push('/boats');
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Editar Embarcação</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Atualize as informações da sua embarcação
          </p>
        </div>

        <Card className="sm:p-2">
          <CardHeader className="sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Informações da Embarcação</CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6">
            {error && (
              <Alert variant="destructive" className="mb-8">
                <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-8">
                <AlertDescription className="text-sm sm:text-base">{success}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base sm:text-lg">Nome da Embarcação</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome da embarcação" 
                          className="h-12 sm:h-14 px-4 text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base sm:text-lg">Tipo de Embarcação</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-14 px-4 text-base">
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {boatTypes.map((type) => (
                            <SelectItem 
                              key={type} 
                              value={type}
                              className="h-12 sm:h-14 py-3 text-base"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base sm:text-lg">Capacidade (pessoas)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={100} 
                            className="h-12 sm:h-14 px-4 text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_day"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base sm:text-lg">Preço por dia (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="h-12 sm:h-14 px-4 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base sm:text-lg">Localização</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cidade, Estado" 
                          className="h-12 sm:h-14 px-4 text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base sm:text-lg">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva sua embarcação..."
                          className="min-h-[120px] sm:min-h-[150px] px-4 py-3 text-base resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 sm:p-6 space-y-4 sm:space-y-0">
                      <div className="space-y-2">
                        <FormLabel className="text-base sm:text-lg">
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
                          className="scale-125"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold mt-8"
                >
                  Salvar Alterações
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 