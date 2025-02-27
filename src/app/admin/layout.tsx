import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Avaliações',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    name: 'Mensagens',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    name: 'Relatórios',
    href: '/admin/reports',
    icon: BarChart,
  },
  {
    name: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 z-50 flex w-72 flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto border-r bg-card px-6 py-4">
          {/* Logo */}
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="Costa Verde Barcos"
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-72">
        <div className="min-h-screen bg-background">{children}</div>
      </main>
    </div>
  );
} 