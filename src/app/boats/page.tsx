import { Metadata } from 'next'
import BoatSearch from '@/components/boats/BoatSearch'
import BoatCard from '@/components/boats/BoatCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Embarcações Disponíveis',
  description: 'Encontre a embarcação perfeita para sua próxima aventura.',
}

interface SearchParams {
  location?: string
  startDate?: string
  endDate?: string
  guests?: string
  boatType?: string
  minPrice?: string
  maxPrice?: string
  [key: string]: string | undefined
}

const sortOptions = [
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'rating_desc', label: 'Melhor avaliação' },
  { value: 'newest', label: 'Mais recentes' },
]

const features = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'bathroom', label: 'Banheiro' },
  { id: 'kitchen', label: 'Cozinha' },
  { id: 'air_conditioning', label: 'Ar Condicionado' },
  { id: 'sound_system', label: 'Sistema de Som' },
  { id: 'gps', label: 'GPS' },
]

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  let query = supabase
    .from('boats')
    .select('*')
    .eq('status', 'available')

  // Aplicar filtros baseados nos parâmetros de busca
  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
  }

  if (searchParams.guests) {
    query = query.gte('capacity', parseInt(searchParams.guests))
  }

  if (searchParams.boatType && searchParams.boatType !== 'all') {
    query = query.eq('type', searchParams.boatType)
  }

  if (searchParams.minPrice) {
    query = query.gte('daily_rate', parseInt(searchParams.minPrice))
  }

  if (searchParams.maxPrice) {
    query = query.lte('daily_rate', parseInt(searchParams.maxPrice))
  }

  // Ordenação
  const sort = searchParams.sort || 'newest'
  switch (sort) {
    case 'price_asc':
      query = query.order('daily_rate', { ascending: true })
      break
    case 'price_desc':
      query = query.order('daily_rate', { ascending: false })
      break
    case 'rating_desc':
      query = query.order('rating', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: boats, error } = await query

  if (error) {
    console.error('Erro ao buscar embarcações:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Ocorreu um erro ao carregar as embarcações. Por favor, tente novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barra de Busca */}
      <div className="mb-8">
        <BoatSearch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros Laterais */}
        <aside className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Ordenar por</h3>
            <Select defaultValue={sort}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Faixa de Preço</h3>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 5000]}
                max={10000}
                step={100}
                className="mt-6"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>R$ 0</span>
                <span>R$ 10.000</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center">
                  <Checkbox id={feature.id} />
                  <Label htmlFor={feature.id} className="ml-2">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full">Aplicar Filtros</Button>
        </aside>

        {/* Lista de Embarcações */}
        <div className="lg:col-span-3">
          {boats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Nenhuma embarcação encontrada com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 