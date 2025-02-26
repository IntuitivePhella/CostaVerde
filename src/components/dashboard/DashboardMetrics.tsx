'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Boat,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

type DashboardMetrics = {
  totalBoats: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeListings: number;
  totalUsers: number;
};

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBoats: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeListings: 0,
    totalUsers: 0,
  });

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Buscar total de barcos
        const { count: totalBoats } = await supabase
          .from('boats')
          .select('*', { count: 'exact' });

        // Buscar total de reservas e receita
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_price');

        const totalRevenue = bookings?.reduce(
          (acc, booking) => acc + booking.total_price,
          0
        ) || 0;

        // Buscar média de avaliações
        const { data: ratings } = await supabase
          .from('reviews')
          .select('rating');

        const averageRating =
          ratings?.reduce((acc, curr) => acc + curr.rating, 0) /
            (ratings?.length || 1) || 0;

        // Buscar total de usuários
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Buscar anúncios ativos
        const { count: activeListings } = await supabase
          .from('boats')
          .select('*', { count: 'exact' })
          .eq('is_active', true);

        setMetrics({
          totalBoats: totalBoats || 0,
          totalBookings: bookings?.length || 0,
          totalRevenue,
          averageRating,
          activeListings: activeListings || 0,
          totalUsers: totalUsers || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }
    };

    fetchMetrics();
  }, [supabase]);

  const cards = [
    {
      title: 'Total de Embarcações',
      value: metrics.totalBoats,
      description: 'Embarcações cadastradas',
      icon: Boat,
      trend: '+2.5%',
    },
    {
      title: 'Reservas',
      value: metrics.totalBookings,
      description: 'Reservas realizadas',
      icon: Calendar,
      trend: '+15.2%',
    },
    {
      title: 'Faturamento',
      value: `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })}`,
      description: 'Receita total',
      icon: DollarSign,
      trend: '+10.3%',
    },
    {
      title: 'Avaliação Média',
      value: metrics.averageRating.toFixed(1),
      description: 'Média de avaliações',
      icon: Star,
      trend: '+0.2',
    },
    {
      title: 'Anúncios Ativos',
      value: metrics.activeListings,
      description: 'Listagens ativas',
      icon: TrendingUp,
      trend: '+5.0%',
    },
    {
      title: 'Usuários',
      value: metrics.totalUsers,
      description: 'Usuários registrados',
      icon: Users,
      trend: '+12.5%',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <span className="text-xs text-green-500">{card.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 