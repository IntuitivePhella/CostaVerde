'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAPrompt = () => {
  const { isInstallable, installPWA, requestNotificationPermission } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
    if (hasSeenPrompt) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Instalar Aplicativo</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Instale o Costa Verde Barcos para uma experiência melhor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Acesse rapidamente, receba notificações e use offline.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
          >
            Agora não
          </Button>
          <Button
            size="sm"
            onClick={() => {
              installPWA();
              requestNotificationPermission();
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Instalar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 