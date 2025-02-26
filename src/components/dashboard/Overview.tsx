'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartData = {
  date: string;
  bookings: number;
  revenue: number;
};

export function Overview() {
  const [data, setData] = useState<ChartData[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('created_at, total_price')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      if (bookings) {
        const chartData = bookings.reduce<{ [key: string]: ChartData }>(
          (acc, booking) => {
            const date = new Date(booking.created_at).toLocaleDateString('pt-BR');
            if (!acc[date]) {
              acc[date] = {
                date,
                bookings: 0,
                revenue: 0,
              };
            }
            acc[date].bookings += 1;
            acc[date].revenue += booking.total_price;
            return acc;
          },
          {}
        );

        setData(Object.values(chartData));
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$ ${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 