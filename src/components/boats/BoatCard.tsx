import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Anchor, Users, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BoatCardProps {
  boat: {
    id: string;
    name: string;
    description: string;
    daily_rate: number;
    capacity: number;
    location: string;
    images: string[];
    specifications: {
      length: number;
      year: number;
      manufacturer: string;
      model: string;
    };
    rating?: number;
    reviews_count?: number;
  };
}

const BoatCard = ({ boat }: BoatCardProps) => {
  return (
    <Card className="overflow-hidden group">
      {/* Imagem Principal */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={boat.images[0]}
          alt={boat.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 space-x-2">
          <Badge variant="secondary" className="bg-white/90">
            {boat.specifications.year}
          </Badge>
          <Badge variant="secondary" className="bg-white/90">
            {boat.specifications.length}m
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{boat.name}</h3>
            <p className="text-sm text-gray-500">{boat.location}</p>
          </div>
          {boat.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-medium">
                {boat.rating.toFixed(1)}
              </span>
              {boat.reviews_count && (
                <span className="text-sm text-gray-500 ml-1">
                  ({boat.reviews_count})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Especificações */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Anchor className="h-4 w-4 mr-2" />
            {boat.specifications.manufacturer} {boat.specifications.model}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            Até {boat.capacity} pessoas
          </div>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {boat.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(boat.daily_rate)}
          </span>
          <span className="text-sm text-gray-500">/dia</span>
        </div>
        <Button asChild>
          <Link href={`/boats/${boat.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BoatCard; 