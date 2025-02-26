import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Boat,
  Calendar,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const menuItems = [
  {
    title: 'Visão Geral',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Embarcações',
    href: '/dashboard/boats',
    icon: Boat,
  },
  {
    title: 'Reservas',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    title: 'Clientes',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Mensagens',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Costa Verde Barcos"
            className="h-8 w-8"
          />
          <span className="font-semibold text-xl">Costa Verde</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                  'transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Status do Proprietário</CardTitle>
            <CardDescription>Verificado</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-2">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Taxa de Resposta</span>
                  <span className="font-medium text-foreground">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tempo de Resposta</span>
                  <span className="font-medium text-foreground">~2h</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Ver Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 