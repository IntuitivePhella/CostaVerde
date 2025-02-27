'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useReviewStats } from '@/hooks/useReviewStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReviewStatsProps {
  boatId: string;
  ownerId: string;
  className?: string;
}

export const ReviewStats = ({ boatId, ownerId, className }: ReviewStatsProps) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>(
    'month'
  );

  const { data: stats, isLoading } = useReviewStats({
    boatId,
    ownerId,
    timeframe,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      return 'Menos de 1 hora';
    }
    if (hours < 24) {
      return `${Math.round(hours)} horas`;
    }
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  };

  const cards = [
    {
      title: 'Avaliação Média',
      value: stats.averageRating.toFixed(1),
      description: `${stats.totalReviews} avaliações`,
      icon: Star,
      iconColor: 'text-yellow-400',
    },
    {
      title: 'Taxa de Resposta',
      value: `${(stats.responseRate * 100).toFixed(0)}%`,
      description: 'das avaliações respondidas',
      icon: MessageSquare,
      iconColor: 'text-green-500',
    },
    {
      title: 'Tempo de Resposta',
      value: formatResponseTime(stats.averageResponseTime),
      description: 'tempo médio',
      icon: Clock,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Tendência',
      value: stats.monthlyTrends.length > 1
        ? stats.monthlyTrends[stats.monthlyTrends.length - 1].averageRating >
          stats.monthlyTrends[stats.monthlyTrends.length - 2].averageRating
          ? '↑'
          : '↓'
        : '―',
      description: 'comparado ao mês anterior',
      icon: TrendingUp,
      iconColor: 'text-purple-500',
    },
  ];

  const formatRating = (rating: number) => rating.toFixed(1);
  const calculatePercentage = (count: number) => (count / stats.totalReviews) * 100;

  const criteriaLabels = {
    cleanliness: 'Limpeza',
    communication: 'Comunicação',
    accuracy: 'Precisão',
    value: 'Custo-Benefício',
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium">Estatísticas das Avaliações</h3>
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon
                className={`h-4 w-4 ${card.iconColor}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tendência de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return format(new Date(+year, +month - 1), 'MMM yyyy', {
                      locale: ptBR,
                    });
                  }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Mês
                              </span>
                              <span className="font-bold">
                                {format(
                                  new Date(
                                    ...data.month.split('-').map(Number)
                                  ),
                                  'MMMM yyyy',
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Avaliação
                              </span>
                              <span className="font-bold">
                                {data.averageRating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Avaliação Geral */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-4xl font-bold">{formatRating(stats.averageRating)}</span>
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
          </span>
        </div>

        {/* Distribuição de avaliações */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0;
            const percentage = calculatePercentage(count);
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-12 text-sm">{rating} estrelas</span>
                <Progress value={percentage} className="h-2" />
                <span className="w-12 text-sm text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Médias por critério */}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(stats.criteriaAverages) as [keyof typeof criteriaLabels, number][]).map(
          ([criterion, rating]) => (
            <div key={criterion} className="flex items-center justify-between">
              <span className="text-sm">{criteriaLabels[criterion]}</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={cn('h-4 w-4', {
                        'fill-yellow-400 text-yellow-400': value <= Math.round(rating),
                        'fill-gray-200 text-gray-200': value > Math.round(rating),
                      })}
                    />
                  ))}
                </div>
                <span className="w-8 text-sm text-muted-foreground">
                  {formatRating(rating)}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}; 