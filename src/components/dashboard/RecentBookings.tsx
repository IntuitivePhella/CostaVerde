'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  boats: {
    name: string;
  };
};

const statusMap = {
  pending: {
    label: 'Pendente',
    variant: 'warning',
  },
  confirmed: {
    label: 'Confirmada',
    variant: 'success',
  },
  cancelled: {
    label: 'Cancelada',
    variant: 'destructive',
  },
} as const;

export function RecentBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url
          ),
          boats (
            name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setBookings(data as BookingWithDetails[]);
      }
    };

    fetchBookings();
  }, [supabase]);

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {booking.profiles.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={booking.profiles.avatar_url}
                alt={booking.profiles.full_name}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback>
                {booking.profiles.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {booking.profiles.full_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.boats.name}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Badge
              variant={
                statusMap[
                  booking.status as keyof typeof statusMap
                ].variant as 'default' | 'secondary' | 'destructive' | 'outline'
              }
            >
              {statusMap[booking.status as keyof typeof statusMap].label}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
} 