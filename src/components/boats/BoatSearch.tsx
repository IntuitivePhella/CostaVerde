"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Search } from 'lucide-react'

interface SearchParams {
  location: string
  startDate: Date | undefined
  endDate: Date | undefined
  guests: number
  boatType: string
}

const boatTypes = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'yacht', label: 'Iate' },
  { value: 'speedboat', label: 'Lancha' },
  { value: 'sailboat', label: 'Veleiro' },
  { value: 'catamaran', label: 'Catamarã' },
]

const BoatSearch = () => {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    startDate: undefined,
    endDate: undefined,
    guests: 1,
    boatType: 'all',
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set('location', searchParams.location)
    if (searchParams.startDate) {
      params.set('startDate', searchParams.startDate.toISOString())
    }
    if (searchParams.endDate) {
      params.set('endDate', searchParams.endDate.toISOString())
    }
    params.set('guests', searchParams.guests.toString())
    params.set('boatType', searchParams.boatType)

    router.push(`/boats?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Localização */}
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            placeholder="Para onde você vai?"
            value={searchParams.location}
            onChange={(e) =>
              setSearchParams({ ...searchParams, location: e.target.value })
            }
          />
        </div>

        {/* Data de Início */}
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startDate ? (
                  format(searchParams.startDate, 'PPP', { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchParams.startDate}
                onSelect={(date) =>
                  setSearchParams({ ...searchParams, startDate: date })
                }
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data de Término */}
        <div className="space-y-2">
          <Label>Data de Término</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.endDate ? (
                  format(searchParams.endDate, 'PPP', { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchParams.endDate}
                onSelect={(date) =>
                  setSearchParams({ ...searchParams, endDate: date })
                }
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Número de Convidados */}
        <div className="space-y-2">
          <Label htmlFor="guests">Convidados</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            value={searchParams.guests}
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                guests: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        {/* Tipo de Embarcação */}
        <div className="space-y-2">
          <Label>Tipo de Embarcação</Label>
          <Select
            value={searchParams.boatType}
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, boatType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              {boatTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de Busca */}
      <div className="mt-6">
        <Button
          className="w-full md:w-auto"
          onClick={handleSearch}
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar Embarcações
        </Button>
      </div>
    </div>
  )
}

export default BoatSearch 