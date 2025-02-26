import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-4 w-[250px] mt-2" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Botão */}
          <Skeleton className="h-10 w-[150px]" />
        </CardContent>
      </Card>
    </div>
  );
} 