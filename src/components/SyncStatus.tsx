'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePWA } from '@/hooks/usePWA';
import { useOfflineBookings } from '@/hooks/useOfflineBookings';
import { useOfflineFavorites } from '@/hooks/useOfflineFavorites';

interface SyncStatusProps {
  userId: string;
}

export const SyncStatus = ({ userId }: SyncStatusProps) => {
  const { isOnline } = usePWA();
  const { hasOfflineBookings } = useOfflineBookings(userId);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simular sincronização
  const handleSync = async () => {
    setIsSyncing(true);
    // Aguardar sincronização do service worker
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  // Tentar sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (isOnline && hasOfflineBookings) {
      handleSync();
    }
  }, [isOnline, hasOfflineBookings]);

  if (!hasOfflineBookings && isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-500"
            >
              <Cloud className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Todos os dados estão sincronizados</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              isOnline ? 'text-yellow-500' : 'text-red-500'
            }`}
            onClick={isOnline ? handleSync : undefined}
            disabled={!isOnline || isSyncing}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : isOnline ? (
              <Cloud className="h-4 w-4" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSyncing ? (
            <p>Sincronizando dados...</p>
          ) : isOnline ? (
            <p>Existem dados para sincronizar</p>
          ) : (
            <p>Você está offline</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 