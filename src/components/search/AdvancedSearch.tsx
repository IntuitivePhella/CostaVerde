import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { CalendarIcon, Search } from 'lucide-react';

interface SearchFilters {
  location: string;
  dates: {
    from: Date | undefined;
    to: Date | undefined;
  };
  boatType: string;
  guests: number;
  priceRange: [number, number];
}

export const AdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    dates: {
      from: undefined,
      to: undefined,
    },
    boatType: '',
    guests: 1,
    priceRange: [0, 10000],
  });

  const handleSearch = () => {
    // Implementar lógica de busca
    console.log('Filtros:', filters);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Localização
          </label>
          <Input
            placeholder="Para onde você vai?"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Datas
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dates.from ? (
                  filters.dates.to ? (
                    <>
                      {format(filters.dates.from, 'P', { locale: ptBR })} -{' '}
                      {format(filters.dates.to, 'P', { locale: ptBR })}
                    </>
                  ) : (
                    format(filters.dates.from, 'P', { locale: ptBR })
                  )
                ) : (
                  <span>Selecione as datas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dates.from}
                selected={{
                  from: filters.dates.from,
                  to: filters.dates.to,
                }}
                onSelect={(range) =>
                  setFilters({
                    ...filters,
                    dates: {
                      from: range?.from,
                      to: range?.to,
                    },
                  })
                }
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tipo de Barco
          </label>
          <Select
            value={filters.boatType}
            onValueChange={(value) =>
              setFilters({ ...filters, boatType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lancha">Lancha</SelectItem>
              <SelectItem value="veleiro">Veleiro</SelectItem>
              <SelectItem value="iate">Iate</SelectItem>
              <SelectItem value="catamarã">Catamarã</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Convidados
          </label>
          <Input
            type="number"
            min={1}
            value={filters.guests}
            onChange={(e) =>
              setFilters({ ...filters, guests: parseInt(e.target.value) })
            }
          />
        </div>

        <div>
          <Button
            className="h-full w-full bg-[#00adef] hover:bg-[#1322ad]"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">
          Faixa de Preço (R$)
        </label>
        <div className="mt-2">
          <Slider
            value={filters.priceRange}
            min={0}
            max={10000}
            step={100}
            onValueChange={(value) =>
              setFilters({ ...filters, priceRange: value as [number, number] })
            }
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>R$ {filters.priceRange[0]}</span>
            <span>R$ {filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 