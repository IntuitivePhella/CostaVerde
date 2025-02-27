import { Metadata } from 'next';
import { BoatRanking } from '@/components/boats/BoatRanking';

export const metadata: Metadata = {
  title: 'Ranking - Costa Verde Barcos',
  description:
    'Confira o ranking dos melhores barcos e proprietários da Costa Verde Barcos, baseado em avaliações reais dos nossos clientes.',
};

export default function RankingPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Ranking</h1>
        <p className="mt-2 text-muted-foreground">
          Conheça os barcos e proprietários mais bem avaliados da nossa plataforma.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ranking de Barcos */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Melhores Barcos</h2>
          <BoatRanking defaultTab="boats" />
        </section>

        {/* Ranking de Proprietários */}
        <section>
          <h2 className="mb-4 text-2xl font-bold">Melhores Proprietários</h2>
          <BoatRanking defaultTab="owners" />
        </section>
      </div>

      {/* Informações sobre o Ranking */}
      <section className="mt-12 rounded-lg bg-muted p-6">
        <h2 className="mb-4 text-2xl font-bold">Como funciona o ranking?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold">Avaliações</h3>
            <p className="text-sm text-muted-foreground">
              O ranking é baseado nas avaliações dos clientes, considerando critérios
              como limpeza, comunicação, precisão e custo-benefício.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Reservas</h3>
            <p className="text-sm text-muted-foreground">
              A quantidade e qualidade das reservas também influencia a posição no
              ranking, premiando a consistência no serviço.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Atendimento</h3>
            <p className="text-sm text-muted-foreground">
              A taxa de resposta e o tempo médio de resposta são fatores importantes
              para determinar a posição no ranking.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
} 