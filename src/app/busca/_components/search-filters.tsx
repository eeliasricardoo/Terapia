import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { PsychologistSearchFilters } from '@/lib/supabase/types'
import { useEffect, useState, memo, useCallback } from 'react'
import { getHealthInsurances } from '@/lib/actions/health-insurance'
import { SPECIALIZATIONS } from '@/lib/constants/specializations'

interface SearchFiltersProps {
  filters: PsychologistSearchFilters
  onFilterChange: (filters: PsychologistSearchFilters) => void
}

const specialtiesList = Array.from(SPECIALIZATIONS)

export const SearchFilters = memo(function SearchFilters({
  filters,
  onFilterChange,
}: SearchFiltersProps) {
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

  const handleSpecialtyToggle = useCallback(
    (specialty: string, checked: boolean) => {
      const currentSpecialties = filters.specialties || []
      const nextSpecialties = checked
        ? [...currentSpecialties, specialty]
        : currentSpecialties.filter((s) => s !== specialty)

      onFilterChange({ ...filters, specialties: nextSpecialties })
    },
    [filters, onFilterChange]
  )

  const handleInsuranceToggle = useCallback(
    (id: string, checked: boolean) => {
      const currentInsurances = filters.healthInsurances || []
      const nextInsurances = checked
        ? [...currentInsurances, id]
        : currentInsurances.filter((i) => i !== id)

      onFilterChange({ ...filters, healthInsurances: nextInsurances })
    },
    [filters, onFilterChange]
  )

  const handlePriceChange = useCallback(
    (value: number[]) => {
      onFilterChange({ ...filters, maxPrice: value[0] })
    },
    [filters, onFilterChange]
  )

  const handleGenderToggle = useCallback(
    (gender: string, checked: boolean) => {
      const currentGenders = filters.genders || []
      const nextGenders = checked
        ? [...currentGenders, gender]
        : currentGenders.filter((g) => g !== gender)

      onFilterChange({ ...filters, genders: nextGenders })
    },
    [filters, onFilterChange]
  )

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

      <div className="space-y-2.5">
        <h4 className="text-sm font-medium leading-none text-slate-900">Gênero</h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'Feminino', label: 'Feminino' },
            { id: 'Masculino', label: 'Masculino' },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-gender-${item.id}`}
                checked={filters.genders?.includes(item.id)}
                onCheckedChange={(checked) => handleGenderToggle(item.id, !!checked)}
              />
              <label
                htmlFor={`filter-gender-${item.id}`}
                className="text-sm font-normal leading-none cursor-pointer text-slate-600 hover:text-slate-900"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="pt-2">
        <p className="text-[11px] text-slate-400 font-medium">
          <span className="text-blue-500 font-bold mr-1">Próximas atualizações:</span>
          Filtros por idiomas e disponibilidade em tempo real.
        </p>
      </div>
    </div>
  )
})
