import {
  Anchor,
  Calendar,
  Home,
  Ruler,
  Ship,
  Users,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TIPOS_BARCO } from '@/types/boat';
import type { Boat } from '@/types/boat';

interface BoatFeaturesProps {
  boat: Boat;
}

export const BoatFeatures = ({ boat }: BoatFeaturesProps) => {
  const tipoLabel = TIPOS_BARCO.find((t) => t.value === boat.tipo)?.label;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Características Principais</CardTitle>
          <CardDescription>
            Informações essenciais sobre o barco
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-[#00adef]" />
            <span>Tipo: {tipoLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00adef]" />
            <span>
              Capacidade: {boat.capacidade}{' '}
              {boat.capacidade === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#00adef]" />
            <span>Comprimento: {boat.caracteristicas.comprimento}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#00adef]" />
            <span>Ano: {boat.caracteristicas.ano}</span>
          </div>
          {boat.caracteristicas.cabines && (
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-[#00adef]" />
              <span>
                {boat.caracteristicas.cabines}{' '}
                {boat.caracteristicas.cabines === 1 ? 'cabine' : 'cabines'}
              </span>
            </div>
          )}
          {boat.caracteristicas.banheiros && (
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-[#00adef]" />
              <span>
                {boat.caracteristicas.banheiros}{' '}
                {boat.caracteristicas.banheiros === 1
                  ? 'banheiro'
                  : 'banheiros'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-[#00adef]" />
            <span>
              {boat.caracteristicas.possui_tripulacao
                ? 'Inclui tripulação'
                : 'Sem tripulação'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comodidades</CardTitle>
          <CardDescription>
            Itens e serviços disponíveis a bordo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2">
            {boat.comodidades.map((comodidade) => (
              <li
                key={comodidade}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#00adef]" />
                {comodidade}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 