'use client';

import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { BoatCard } from '@/components/boats/BoatCard';
import { Button } from '@/components/ui/button';
import { useBoats } from '@/hooks/useBoats';
import type { BoatSummary } from '@/types/boat';

type SortBy = 'daily_rate_asc' | 'daily_rate_desc' | 'newest';

interface BoatsResponse {
  boats: BoatSummary[];
  totalCount: number;
}

type InfiniteBoatsResponse = InfiniteData<BoatsResponse>;

export const BoatList = () => {
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();

  const boatsQuery = useBoats({
    boat_type: searchParams.get('tipo') || undefined,
    location: searchParams.get('cidade') 
      ? `${searchParams.get('cidade')}${searchParams.get('estado') ? `, ${searchParams.get('estado')}` : ''}`
      : undefined,
    min_capacity: searchParams.get('capacidade_min')
      ? parseInt(searchParams.get('capacidade_min')!)
      : undefined,
    max_daily_rate: searchParams.get('preco_max')
      ? parseInt(searchParams.get('preco_max')!)
      : undefined,
    sort_by: (searchParams.get('ordenar_por') as SortBy) || undefined,
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = boatsQuery as unknown as UseInfiniteQueryResult<BoatsResponse, Error> & {
    data: InfiniteBoatsResponse;
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return null;
  }

  if (!data?.pages[0].boats.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">
          Nenhum barco encontrado
        </h2>
        <p className="text-muted-foreground">
          Tente ajustar os filtros para encontrar mais opções
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.pages.map((page: BoatsResponse) =>
          page.boats.map((boat: BoatSummary) => (
            <BoatCard key={boat.id} boat={boat} />
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center" ref={ref}>
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Carregando mais...'
              : 'Carregar mais barcos'}
          </Button>
        </div>
      )}
    </div>
  );
}; 