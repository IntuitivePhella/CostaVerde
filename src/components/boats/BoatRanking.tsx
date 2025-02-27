import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

interface RankingItem {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  response_rate: number;
}

interface RankingProps {
  className?: string;
}

export const BoatRanking = ({ className }: RankingProps) => {
  const [selectedTab, setSelectedTab] = useState<'boats' | 'owners'>('boats');
  const supabase = createClientComponentClient<Database>();

  const { data: ranking = [], isLoading } = useQuery({
    queryKey: ['ranking', selectedTab],
    queryFn: async () => {
      if (selectedTab === 'boats') {
        const { data, error } = await supabase
          .from('boats')
          .select(`
            id,
            name,
            avatar_url: main_image_url,
            reviews:reviews(count),
            bookings:bookings(count),
            rating:reviews(rating)
          `)
          .eq('reviews.status', 'approved')
          .order('rating', { ascending: false })
          .limit(10);

        if (error) throw error;

        return data.map((boat) => ({
          id: boat.id,
          name: boat.name,
          avatar_url: boat.avatar_url,
          rating: boat.rating || 0,
          total_reviews: boat.reviews?.length || 0,
          total_bookings: boat.bookings?.length || 0,
          response_rate: 0, // Implementar cálculo
        }));
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            boats:boats(
              reviews:reviews(count),
              bookings:bookings(count),
              rating:reviews(rating)
            )
          `)
          .eq('is_owner', true)
          .eq('boats.reviews.status', 'approved')
          .order('boats.rating', { ascending: false })
          .limit(10);

        if (error) throw error;

        return data.map((owner) => ({
          id: owner.id,
          name: owner.full_name,
          avatar_url: owner.avatar_url,
          rating:
            owner.boats?.reduce((acc, boat) => acc + (boat.rating || 0), 0) /
              (owner.boats?.length || 1) || 0,
          total_reviews:
            owner.boats?.reduce(
              (acc, boat) => acc + (boat.reviews?.length || 0),
              0
            ) || 0,
          total_bookings:
            owner.boats?.reduce(
              (acc, boat) => acc + (boat.bookings?.length || 0),
              0
            ) || 0,
          response_rate: 0, // Implementar cálculo
        }));
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRankingColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-500';
      case 1:
        return 'text-gray-400';
      case 2:
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Ranking</h2>
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
            <TabsList>
              <TabsTrigger value="boats">Barcos</TabsTrigger>
              <TabsTrigger value="owners">Proprietários</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <TabsContent value={selectedTab} className="mt-0">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : ranking.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum {selectedTab === 'boats' ? 'barco' : 'proprietário'} encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {ranking.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                      getRankingColor(index)
                    )}
                  >
                    {index < 3 ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}º</span>
                    )}
                  </div>

                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.total_reviews} avaliações</span>
                        <span>{item.total_bookings} reservas</span>
                        <span>{Math.round(item.response_rate * 100)}% resposta</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">{item.rating.toFixed(1)}</span>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}; 