import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('SearchPage')
  const [insurances, setInsurances] = useState<{ id: string; name: string }[]>([])
  const [insurancesError, setInsurancesError] = useState(false)

  useEffect(() => {
    async function fetchInsurances() {
      try {
        const result = await getHealthInsurances()
        if (result.success && result.data) {
          setInsurances(result.data)
        } else {
          setInsurancesError(true)
        }
      } catch {
        setInsurancesError(true)
      }
    }
    fetchInsurances()
  }, [])

  const handleSearchChange = useCallback(
    (query: string) => {
      onFilterChange({ ...filters, searchQuery: query })
    },
    [filters, onFilterChange]
  )

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
    <div className="space-y-4">
      {/* Search Input Integrated */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t('filters.quickSearch')}
        </h4>
        <div className="relative group/search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="pl-9 h-10 text-sm rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      <Separator className="bg-slate-100/60" />

      {/* Specialties */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t('filters.specialties')}
        </h4>
        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
          {specialtiesList.map((item) => (
            <div key={item} className="flex items-center space-x-2 group">
              <Checkbox
                id={`filter-${item}`}
                checked={filters.specialties?.includes(item)}
                onCheckedChange={(checked) => handleSpecialtyToggle(item, !!checked)}
                className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors h-4 w-4"
              />
              <label
                htmlFor={`filter-${item}`}
                className="text-sm font-medium leading-none cursor-pointer text-slate-600 group-hover:text-slate-900 transition-colors"
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100/60" />

      {/* Health Insurances */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t('filters.insurances')}
        </h4>
        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
          {insurances.map((ins) => (
            <div key={ins.id} className="flex items-center space-x-2 group">
              <Checkbox
                id={`filter-ins-${ins.id}`}
                checked={filters.healthInsurances?.includes(ins.id)}
                onCheckedChange={(checked) => handleInsuranceToggle(ins.id, !!checked)}
                className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors h-4 w-4"
              />
              <label
                htmlFor={`filter-ins-${ins.id}`}
                className="text-sm font-medium leading-none cursor-pointer text-slate-600 group-hover:text-slate-900 transition-colors"
              >
                {ins.name}
              </label>
            </div>
          ))}
          {insurancesError && (
            <p className="text-xs text-red-400 italic">{t('filters.insurancesError')}</p>
          )}
          {!insurancesError && insurances.length === 0 && (
            <p className="text-xs text-slate-400 italic">{t('filters.noInsurances')}</p>
          )}
        </div>
      </div>

      <Separator className="bg-slate-100/60" />

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {t('filters.investment')}
          </h4>
          <span className="text-xs font-bold text-primary">
            {t('filters.upTo', { amount: `R$ ${filters.maxPrice || 500}` })}
          </span>
        </div>
        <Slider
          value={[filters.maxPrice || 500]}
          max={500}
          min={50}
          step={10}
          onValueChange={handlePriceChange}
          className="py-1"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
          <span>R$ 50</span>
          <span>R$ 500+</span>
        </div>
      </div>

      <Separator className="bg-slate-100/60" />

      {/* Gender */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t('filters.gender')}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'Feminino', label: t('filters.female') },
            { id: 'Masculino', label: t('filters.male') },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-2 group bg-slate-50 p-2 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <Checkbox
                id={`filter-gender-${item.id}`}
                checked={filters.genders?.includes(item.id)}
                onCheckedChange={(checked) => handleGenderToggle(item.id, !!checked)}
                className="border-slate-300 shadow-none h-4 w-4"
              />
              <label
                htmlFor={`filter-gender-${item.id}`}
                className="text-xs font-bold leading-none cursor-pointer text-slate-600 group-hover:text-slate-900 transition-colors"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
          <p className="text-[10px] text-indigo-600 font-semibold leading-tight text-center">
            {t('filters.moreComingSoon')}
          </p>
        </div>
      </div>
    </div>
  )
})
