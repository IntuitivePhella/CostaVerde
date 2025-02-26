import Image from 'next/image';
import Link from 'next/link';
import { Users, Anchor, MapPin } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TIPOS_BARCO } from '@/types/boat';
import type { BoatSummary } from '@/types/boat';

interface BoatCardProps {
  boat: BoatSummary;
}

export const BoatCard = ({ boat }: BoatCardProps) => {
  const tipoLabel = TIPOS_BARCO.find((t) => t.value === boat.tipo)?.label;
  const preco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(boat.preco_dia);

  return (
    <Link href={`/barcos/${boat.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[4/3]">
          <Image
            src={boat.imagens[0]}
            alt={boat.nome}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 bg-white/90"
          >
            {tipoLabel}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-[#1322ad] line-clamp-1">
            {boat.nome}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} />
            <span className="text-sm">
              {boat.localizacao.cidade}, {boat.localizacao.estado}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Users size={16} />
            <span className="text-sm">
              Até {boat.capacidade} {boat.capacidade === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#00adef]">
            <Anchor size={16} />
            <span className="font-medium">{preco}</span>
          </div>
          <span className="text-sm text-muted-foreground">por dia</span>
        </CardFooter>
      </Card>
    </Link>
  );
}; 