'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Search, Filter, ListFilter } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useState, useTransition, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { searchPsychologists } from '@/lib/actions/psychologists'
import { PsychologistSearchFilters, PsychologistWithProfile } from '@/lib/supabase/types'

import { PsychologistCard } from './_components/psychologist-card'
import { SearchFilters } from './_components/search-filters'

const containerVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVars: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function SearchClient({
  initialPsychologists,
}: {
  initialPsychologists: PsychologistWithProfile[]
}) {
  const { isAuthenticated } = useAuth()
  const [psychologists, setPsychologists] =
    useState<PsychologistWithProfile[]>(initialPsychologists)
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<PsychologistSearchFilters>({
    specialties: [],
    maxPrice: 500,
    searchQuery: '',
  })

  // Trigger search when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(filters)
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [filters])

  const handleSearch = async (currentFilters: PsychologistSearchFilters) => {
    startTransition(async () => {
      const results = await searchPsychologists(currentFilters)
      setPsychologists(results)
    })
  }

  const handleFilterChange = (newFilters: PsychologistSearchFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      specialties: [],
      maxPrice: 500,
      searchQuery: '',
    })
  }

  return (
    <motion.div variants={containerVars} initial="initial" animate="animate" className="space-y-8">
      {/* Search Bar - Premium Hero Style */}
      <motion.div
        variants={itemVars}
        className="relative overflow-hidden bg-white p-8 md:p-10 rounded-3xl border border-slate-200/60 shadow-xl shadow-blue-900/5"
      >
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-orange-50/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Encontre seu psicólogo ideal
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              Conecte-se com profissionais qualificados para te apoiar em sua jornada de
              autoconhecimento e bem-estar.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-md group-hover:bg-blue-500/10 transition-colors duration-500" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300 z-10" />
            <Input
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Busque por nome do especialista..."
              className="pl-16 pr-6 h-16 text-lg shadow-sm w-full rounded-full border-2 border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 relative z-0 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filters Trigger */}
        <div className="lg:hidden flex justify-between items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Refine sua busca para encontrar o profissional ideal.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>

          <Select defaultValue="relevance">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Filters Sidebar */}
        <motion.aside variants={itemVars} className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
                <ListFilter className="w-5 h-5 text-blue-600" />
                Filtros
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 rounded-full transition-colors"
              >
                Limpar tudo
              </Button>
            </div>
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </motion.aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{psychologists.length}</span>{' '}
              profissionais disponíveis
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Relevância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 opacity-60 grayscale-[0.5] transition-all">
              {psychologists.map((psychologist) => (
                <div key={psychologist.id} className="h-full">
                  <PsychologistCard psychologist={psychologist} />
                </div>
              ))}
            </div>
          ) : psychologists.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nenhum profissional encontrado</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                Tente ajustar seus filtros ou buscar por outros termos para encontrar o que precisa.
              </p>
              <Button onClick={clearFilters} className="mt-6 rounded-full px-8" variant="outline">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <motion.div
              variants={containerVars}
              className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
            >
              {psychologists.map((psychologist) => (
                <motion.div key={psychologist.id} variants={itemVars} className="h-full">
                  <PsychologistCard psychologist={psychologist} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {psychologists.length > 0 && !isPending && (
            <motion.div variants={itemVars} className="mt-12 flex justify-center">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Carregar mais profissionais
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
