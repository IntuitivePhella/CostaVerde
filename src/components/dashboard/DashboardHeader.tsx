'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Plus, Settings } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function DashboardHeader() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      }
    };

    fetchProfile();
  }, [supabase]);

  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
          <AvatarFallback>
            {profile?.full_name?.split(' ').map(name => name[0]).join('').toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">
            Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Usuário'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Embarcação
        </Button>
      </div>
    </div>
  );
} 