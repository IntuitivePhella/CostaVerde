"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from 'react';
import { Overview } from '@/components/dashboard/Overview';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  Boat,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

type DashboardMetrics = {
  totalBoats: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeListings: number;
  totalUsers: number;
};

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
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

        // Buscar total de reservas
        const { count: totalBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact' });

        // Buscar média de avaliações
        const { data: ratings } = await supabase
          .from('reviews')
          .select('rating');

        const averageRating =
          ratings?.reduce((acc, curr) => acc + curr.rating, 0) /
            (ratings?.length || 1) || 0;

        // Atualizar métricas
        setMetrics({
          totalBoats: totalBoats || 0,
          totalBookings: totalBookings || 0,
          totalRevenue: 0, // Implementar cálculo real
          averageRating,
          activeListings: totalBoats || 0, // Implementar filtro de ativos
          totalUsers: 0, // Implementar contagem real
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
      value: `R$ ${metrics.totalRevenue.toLocaleString()}`,
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

  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
            <Skeleton className="h-[180px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <DashboardMetrics />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Overview className="col-span-4" />
            <RecentBookings className="col-span-3" />
          </div>
        </div>
      </main>
    </div>
  )
} 