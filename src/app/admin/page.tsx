import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const metadata: Metadata = {
  title: 'Dashboard - Costa Verde Barcos',
  description: 'Painel administrativo da plataforma Costa Verde Barcos.',
};

interface DashboardMetrics {
  totalUsers: number;
  totalBookings: number;
  totalReviews: number;
  pendingReviews: number;
  totalMessages: number;
  averageRating: number;
  revenueLastMonth: number;
  bookingsLastMonth: number;
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Buscar total de usuários
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Buscar total de reservas
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Buscar métricas de avaliações
  const { data: reviewMetrics } = await supabase
    .from('reviews')
    .select('status, rating')
    .eq('status', 'approved');

  const pendingReviews = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Buscar total de mensagens
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  // Buscar métricas do último mês
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = lastMonth.toISOString();

  const { data: lastMonthBookings } = await supabase
    .from('bookings')
    .select('total_amount')
    .gte('created_at', lastMonthStart);

  return {
    totalUsers: totalUsers || 0,
    totalBookings: totalBookings || 0,
    totalReviews: reviewMetrics?.length || 0,
    pendingReviews: pendingReviews.count || 0,
    totalMessages: totalMessages || 0,
    averageRating:
      reviewMetrics?.reduce((acc, review) => acc + review.rating, 0) /
        (reviewMetrics?.length || 1) || 0,
    revenueLastMonth:
      lastMonthBookings?.reduce((acc, booking) => acc + booking.total_amount, 0) || 0,
    bookingsLastMonth: lastMonthBookings?.length || 0,
  };
}

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics();

  const cards = [
    {
      title: 'Total de Usuários',
      value: metrics.totalUsers.toLocaleString('pt-BR'),
      description: 'usuários registrados',
      icon: Users,
    },
    {
      title: 'Avaliações Pendentes',
      value: metrics.pendingReviews.toLocaleString('pt-BR'),
      description: 'aguardando moderação',
      icon: Star,
    },
    {
      title: 'Mensagens',
      value: metrics.totalMessages.toLocaleString('pt-BR'),
      description: 'trocadas na plataforma',
      icon: MessageSquare,
    },
    {
      title: 'Reservas',
      value: metrics.totalBookings.toLocaleString('pt-BR'),
      description: 'realizadas no total',
      icon: BarChart,
    },
  ];

  const stats = [
    {
      title: 'Avaliação Média',
      value: metrics.averageRating.toFixed(1),
      description: `baseado em ${metrics.totalReviews} avaliações`,
      icon: Star,
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${metrics.revenueLastMonth.toLocaleString('pt-BR')}`,
      description: `${metrics.bookingsLastMonth} reservas no último mês`,
      icon: TrendingUp,
    },
  ];

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Visão geral da plataforma Costa Verde Barcos.
        </p>
      </div>

      {/* Cards principais */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
} 