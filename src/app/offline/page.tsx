import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <AlertTriangle className="h-6 w-6" />
            Sem conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Parece que você está offline. Algumas funcionalidades podem estar limitadas até que sua conexão seja restabelecida.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 