import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIPOS_BARCO } from '@/types/boat';

const filterSchema = z.object({
  tipo: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  capacidade_min: z.coerce.number().min(1).optional(),
  preco_max: z.coerce.number().min(0).optional(),
  ordenar_por: z.enum(['preco_asc', 'preco_desc', 'mais_recentes']).optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export const BoatFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      tipo: searchParams.get('tipo') || undefined,
      cidade: searchParams.get('cidade') || undefined,
      estado: searchParams.get('estado') || undefined,
      capacidade_min: searchParams.get('capacidade_min')
        ? parseInt(searchParams.get('capacidade_min')!)
        : undefined,
      preco_max: searchParams.get('preco_max')
        ? parseInt(searchParams.get('preco_max')!)
        : undefined,
      ordenar_por: (searchParams.get('ordenar_por') as FilterValues['ordenar_por']) || 'mais_recentes',
    },
  });

  const createQueryString = useCallback(
    (values: FilterValues) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const onSubmit = (values: FilterValues) => {
    const queryString = createQueryString(values);
    router.push(pathname + '?' + queryString);
  };

  const handleReset = () => {
    form.reset();
    router.push(pathname);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Embarcação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_BARCO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a cidade" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="UF"
                    maxLength={2}
                    {...field}
                    className="uppercase"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacidade_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidade Mínima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Número de pessoas"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preco_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Máximo por Dia</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="R$ 0,00"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ordenar_por"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordenar Por</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Mais recentes" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mais_recentes">Mais recentes</SelectItem>
                    <SelectItem value="preco_asc">Menor preço</SelectItem>
                    <SelectItem value="preco_desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            className="bg-[#00adef] hover:bg-[#1322ad] text-white"
          >
            Aplicar Filtros
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Limpar Filtros
          </Button>
        </div>
      </form>
    </Form>
  );
}; 