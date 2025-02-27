import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';

const BOAT_TYPES = [
  { value: 'lancha', label: 'Lancha' },
  { value: 'veleiro', label: 'Veleiro' },
  { value: 'iate', label: 'Iate' },
  { value: 'catamaras', label: 'Catamarã' },
  { value: 'jetski', label: 'Jet Ski' },
];

export function BoatFilters() {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('all');

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Filtros</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Tipo de Embarcação</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {BOAT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Faixa de Preço (por dia)</Label>
          <div className="pt-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={5000}
              step={100}
              className="mb-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(priceRange[0])}
              </span>
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(priceRange[1])}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Capacidade Mínima</Label>
          <Input
            type="number"
            placeholder="Número de pessoas"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min={1}
          />
        </div>

        <Button className="w-full" variant="outline">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
} 