'use client';

import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ReviewFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    sortBy: 'recent' | 'rating_high' | 'rating_low';
    minRating: number;
    maxRating: number;
    hasResponse?: boolean;
    dateRange?: 'week' | 'month' | 'year' | 'all';
  }) => void;
  className?: string;
}

export const ReviewFilters = ({
  onFiltersChange,
  className,
}: ReviewFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low'>(
    'recent'
  );
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(5);
  const [hasResponse, setHasResponse] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<
    'week' | 'month' | 'year' | 'all'
  >('all');

  const handleApplyFilters = () => {
    onFiltersChange({
      search: search || undefined,
      sortBy,
      minRating,
      maxRating,
      hasResponse,
      dateRange,
    });
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSortBy('recent');
    setMinRating(1);
    setMaxRating(5);
    setHasResponse(undefined);
    setDateRange('all');
    onFiltersChange({
      sortBy: 'recent',
      minRating: 1,
      maxRating: 5,
    });
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onFiltersChange({
              search: e.target.value || undefined,
              sortBy,
              minRating,
              maxRating,
              hasResponse,
              dateRange,
            });
          }}
          placeholder="Buscar nas avaliações..."
          className="pl-9"
        />
      </div>

      <Select
        value={sortBy}
        onValueChange={(value: 'recent' | 'rating_high' | 'rating_low') => {
          setSortBy(value);
          onFiltersChange({
            search: search || undefined,
            sortBy: value,
            minRating,
            maxRating,
            hasResponse,
            dateRange,
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="rating_high">Maior avaliação</SelectItem>
          <SelectItem value="rating_low">Menor avaliação</SelectItem>
        </SelectContent>
      </Select>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Ajuste os filtros para encontrar as avaliações desejadas.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={dateRange}
                onValueChange={(value: 'week' | 'month' | 'year' | 'all') =>
                  setDateRange(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Avaliação</Label>
              <div className="flex items-center gap-4">
                <span>{minRating}★</span>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[minRating, maxRating]}
                  onValueChange={([min, max]) => {
                    setMinRating(min);
                    setMaxRating(max);
                  }}
                />
                <span>{maxRating}★</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has-response"
                checked={hasResponse}
                onCheckedChange={setHasResponse}
              />
              <Label htmlFor="has-response">Com resposta</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
              >
                Limpar filtros
              </Button>
              <Button onClick={handleApplyFilters}>Aplicar filtros</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}; 