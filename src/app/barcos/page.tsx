'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BoatSummary } from '@/types/boat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search } from 'lucide-react';
import { BoatCard } from '@/components/boats/BoatCard';
import { BoatFilters } from '@/components/boats/BoatFilters';

export default function BoatsPage() {
  const [boats, setBoats] = useState<BoatSummary[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const { data, error } = await supabase
          .from('boats')
          .select('id, name, boat_type, capacity, daily_rate, location, gallery_urls, status')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBoats(data || []);
      } catch (error) {
        setError('Erro ao carregar embarcações.');
      }
    };

    fetchBoats();
  }, [supabase]);

  const filteredBoats = boats.filter(boat =>
    boat.name.toLowerCase().includes(search.toLowerCase()) ||
    boat.boat_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Encontre seu Barco</h1>
          <p className="text-muted-foreground">
            Explore nossa seleção de embarcações disponíveis para aluguel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Input
              type="search"
              placeholder="Buscar embarcações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <BoatFilters />
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoats.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma embarcação encontrada
              </p>
            </div>
          ) : (
            filteredBoats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 