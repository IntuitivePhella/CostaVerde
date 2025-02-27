import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function EditBoatLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-10 w-[180px] sm:w-[200px]" />
          <Skeleton className="h-4 sm:h-5 w-[250px] sm:w-[300px]" />
        </div>

        <Card className="sm:p-2">
          <CardHeader className="sm:p-6">
            <Skeleton className="h-6 sm:h-8 w-[180px] sm:w-[200px]" />
          </CardHeader>
          <CardContent className="sm:p-6 space-y-8">
            {/* Nome */}
            <div className="space-y-3">
              <Skeleton className="h-6 sm:h-7 w-[130px] sm:w-[150px]" />
              <Skeleton className="h-12 sm:h-14 w-full" />
            </div>

            {/* Tipo */}
            <div className="space-y-3">
              <Skeleton className="h-6 sm:h-7 w-[100px] sm:w-[120px]" />
              <Skeleton className="h-12 sm:h-14 w-full" />
            </div>

            {/* Capacidade e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <Skeleton className="h-6 sm:h-7 w-[90px] sm:w-[100px]" />
                <Skeleton className="h-12 sm:h-14 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 sm:h-7 w-[80px] sm:w-[90px]" />
                <Skeleton className="h-12 sm:h-14 w-full" />
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-3">
              <Skeleton className="h-6 sm:h-7 w-[90px] sm:w-[100px]" />
              <Skeleton className="h-12 sm:h-14 w-full" />
            </div>

            {/* Descrição */}
            <div className="space-y-3">
              <Skeleton className="h-6 sm:h-7 w-[70px] sm:w-[80px]" />
              <Skeleton className="h-[120px] sm:h-[150px] w-full" />
            </div>

            {/* Status */}
            <Skeleton className="h-[100px] sm:h-[76px] w-full rounded-lg" />

            {/* Botão */}
            <Skeleton className="h-12 sm:h-14 w-full mt-8" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 