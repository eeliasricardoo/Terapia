import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { PsychologistSearchFilters } from '@/lib/supabase/types'

interface SearchFiltersProps {
  filters: PsychologistSearchFilters
  onFilterChange: (filters: PsychologistSearchFilters) => void
}

const specialtiesList = [
  'Ansiedade',
  'Depressão',
  'Terapia de Casal',
  'TDAH',
  'Autoestima',
  'Carreira',
  'Burnout',
  'Luto',
  'Transtornos Alimentares',
  'TOC',
  'Fobias',
  'Estresse Pós-Traumático',
]

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    const currentSpecialties = filters.specialties || []
    const nextSpecialties = checked
      ? [...currentSpecialties, specialty]
      : currentSpecialties.filter((s) => s !== specialty)

    onFilterChange({ ...filters, specialties: nextSpecialties })
  }

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, maxPrice: value[0] })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <h4 className="text-sm font-medium leading-none text-slate-900">Especialidades</h4>
        <div className="grid grid-cols-1 gap-2">
          {specialtiesList.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${item}`}
                checked={filters.specialties?.includes(item)}
                onCheckedChange={(checked) => handleSpecialtyToggle(item, !!checked)}
              />
              <label
                htmlFor={`filter-${item}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium leading-none text-slate-900">Preço Máximo</h4>
          <span className="text-xs font-bold text-blue-600">Até R$ {filters.maxPrice || 500}</span>
        </div>
        <Slider
          defaultValue={[filters.maxPrice || 500]}
          max={500}
          min={50}
          step={10}
          onValueChange={handlePriceChange}
          className="py-3"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium tracking-wider uppercase">
          <span>R$ 50</span>
          <span>R$ 500+</span>
        </div>
      </div>

      <Separator />

      <div className="pt-2">
        <p className="text-[11px] text-slate-400 italic">
          * Mais filtros (Idiomas, Gênero e Disponibilidade) serão liberados em breve.
        </p>
      </div>
    </div>
  )
}
