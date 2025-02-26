import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Anchor, MapPin, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BoatBookingForm } from '@/components/boats/BoatBookingForm';
import { BoatFeatures } from '@/components/boats/BoatFeatures';
import { BoatGallery } from '@/components/boats/BoatGallery';
import { BoatReviews } from '@/components/boats/BoatReviews';
import { ReviewStats } from '@/components/boats/ReviewStats';
import { createClient } from '@/lib/supabase/server';
import { TIPOS_BARCO } from '@/types/boat';

interface BoatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: BoatPageProps): Promise<Metadata> {
  const supabase = createClient();

  const { data: boat } = await supabase
    .from('boats')
    .select('name, description')
    .eq('id', params.id)
    .single();

  if (!boat) {
    return {
      title: 'Barco não encontrado',
    };
  }

  return {
    title: boat.name,
    description: boat.description,
  };
}

export default async function BoatPage({ params }: BoatPageProps) {
  const supabase = createClient();

  const { data: boat } = await supabase
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
    .eq('id', params.id)
    .single();

  if (!boat) {
    notFound();
  }

  const tipoLabel = TIPOS_BARCO.find((t) => t.value === boat.tipo)?.label;
  const preco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(boat.preco_dia);

  return (
    <div className="container py-10">
      <div className="grid gap-6 lg:grid-cols-6">
        <div className="lg:col-span-4">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{boat.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{tipoLabel}</Badge>
                <Badge variant="secondary">
                  {boat.capacidade} {boat.capacidade === 1 ? 'pessoa' : 'pessoas'}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span>{boat.localizacao.cidade}</span>
                </div>
              </div>
            </div>

            <BoatGallery
              mainImage={boat.imagem_principal}
              gallery={boat.galeria}
            />

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={boat.proprietario.foto_perfil} />
                <AvatarFallback>
                  {boat.proprietario.nome_completo
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#00adef]" />
                  <span className="font-medium">
                    Proprietário: {boat.proprietario.nome_completo}
                  </span>
                </div>
                {boat.localizacao.marina && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Marina: {boat.localizacao.marina}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Sobre o Barco</h2>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                  {boat.descricao}
                </p>
              </div>

              <BoatFeatures boat={boat} />

              {boat.avaliacoes.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Avaliações</h2>
                  <ReviewStats
                    boatId={boat.id}
                    ownerId={boat.proprietario.id}
                    className="mb-6"
                  />
                  <BoatReviews
                    boatId={boat.id}
                    ownerId={boat.proprietario.id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <BoatBookingForm barcoId={boat.id} />
        </div>
      </div>
    </div>
  );
} 