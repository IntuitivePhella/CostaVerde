'use client';

import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react'
import { PWAPrompt } from '@/components/PWAPrompt'
import { SyncStatus } from '@/components/SyncStatus'
import { Providers } from "@/components/providers"

export function LayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">
          <Suspense>
            {children}
            <PWAPrompt />
            <SyncStatus userId="current_user_id" />
          </Suspense>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Providers>
  );
} 