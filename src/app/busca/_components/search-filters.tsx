import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { PsychologistSearchFilters } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'
import { getHealthInsurances } from '@/lib/actions/health-insurance'

interface SearchFiltersProps {
  filters: PsychologistSearchFilters
  onFilterChange: (filters: PsychologistSearchFilters) => void
}

import { SPECIALIZATIONS } from '@/lib/constants/specializations'

interface SearchFiltersProps {
  filters: PsychologistSearchFilters
  onFilterChange: (filters: PsychologistSearchFilters) => void
}

const specialtiesList = Array.from(SPECIALIZATIONS)

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [insurances, setInsurances] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function fetchInsurances() {
      const result = await getHealthInsurances()
      if (result.success && result.data) {
        setInsurances(result.data)
      }
    }
    fetchInsurances()
  }, [])

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    const currentSpecialties = filters.specialties || []
    const nextSpecialties = checked
      ? [...currentSpecialties, specialty]
      : currentSpecialties.filter((s) => s !== specialty)

    onFilterChange({ ...filters, specialties: nextSpecialties })
  }

  const handleInsuranceToggle = (id: string, checked: boolean) => {
    const currentInsurances = filters.healthInsurances || []
    const nextInsurances = checked
      ? [...currentInsurances, id]
      : currentInsurances.filter((i) => i !== id)

    onFilterChange({ ...filters, healthInsurances: nextInsurances })
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

      <div className="space-y-2.5">
        <h4 className="text-sm font-medium leading-none text-slate-900">Planos de Saúde</h4>
        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
          {insurances.map((ins) => (
            <div key={ins.id} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-ins-${ins.id}`}
                checked={filters.healthInsurances?.includes(ins.id)}
                onCheckedChange={(checked) => handleInsuranceToggle(ins.id, !!checked)}
              />
              <label
                htmlFor={`filter-ins-${ins.id}`}
                className="text-sm font-normal leading-none cursor-pointer text-slate-600 hover:text-slate-900"
              >
                {ins.name}
              </label>
            </div>
          ))}
          {insurances.length === 0 && (
            <p className="text-xs text-slate-400 italic">Nenhum plano disponível.</p>
          )}
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
