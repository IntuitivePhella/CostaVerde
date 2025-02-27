import { Metadata } from 'next';
import { ReviewModeration } from '@/components/admin/ReviewModeration';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Moderação de Avaliações - Costa Verde Barcos',
  description: 'Painel de moderação de avaliações da plataforma Costa Verde Barcos.',
};

export default function ReviewModerationPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Moderação de Avaliações</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie as avaliações dos usuários para manter a qualidade da plataforma.
        </p>
      </div>

      {/* Diretrizes de Moderação */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-xl font-semibold">Diretrizes de Moderação</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-2 font-medium">Conteúdo Apropriado</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Experiências reais e verificáveis</li>
              <li>Críticas construtivas</li>
              <li>Fotos e vídeos relevantes</li>
              <li>Linguagem respeitosa</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Conteúdo Proibido</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Linguagem ofensiva ou discriminatória</li>
              <li>Informações pessoais</li>
              <li>Spam ou propaganda</li>
              <li>Conteúdo falso ou enganoso</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Processo de Revisão</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Verificar autenticidade</li>
              <li>Avaliar conteúdo e tom</li>
              <li>Checar fotos e vídeos</li>
              <li>Validar informações</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Ações de Moderação</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Aprovar avaliações válidas</li>
              <li>Rejeitar conteúdo inadequado</li>
              <li>Notificar usuários</li>
              <li>Manter registros</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Componente de Moderação */}
      <ReviewModeration />
    </main>
  );
} 