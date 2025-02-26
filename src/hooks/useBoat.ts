import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Boat } from '@/types/boat';

export const useBoat = (id: string) => {
  return useQuery({
    queryKey: ['boat', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boats')
        .select(`
          *,
          proprietario:profiles(
            id,
            nome_completo,
            foto_perfil
          ),
          avaliacoes:reviews(
            id,
            rating,
            comentario,
            created_at,
            usuario:profiles(
              id,
              nome_completo,
              foto_perfil
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as Boat & {
        proprietario: {
          id: string;
          nome_completo: string;
          foto_perfil?: string;
        };
        avaliacoes: Array<{
          id: string;
          rating: number;
          comentario: string;
          created_at: string;
          usuario: {
            id: string;
            nome_completo: string;
            foto_perfil?: string;
          };
        }>;
      };
    },
  });
}; 