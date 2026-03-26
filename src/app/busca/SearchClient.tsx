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
import { useRef, useCallback, useState, useTransition, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { searchPsychologists } from '@/lib/actions/psychologists'
import { PsychologistSearchFilters, PsychologistWithProfile } from '@/lib/supabase/types'

import { PsychologistCard } from './_components/psychologist-card'
import { SearchFilters } from './_components/search-filters'
import { PsychologistCardSkeleton } from './_components/psychologist-card-skeleton'

const containerVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
}

const itemVars: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPsychologists.length >= 12)
  const [hasInteracted, setHasInteracted] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const pageSize = 12

  // Trigger search only when filters actually change (not on mount)
  useEffect(() => {
    if (!hasInteracted) return // Skip initial mount

    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      setHasMore(true)
      handleSearch(filters, 1, false)
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [filters, hasInteracted])

  const handleSearch = async (
    currentFilters: PsychologistSearchFilters,
    currentPage: number,
    isLoadMore: boolean
  ) => {
    startTransition(async () => {
      const results = await searchPsychologists({
        ...currentFilters,
        page: currentPage,
        pageSize,
      })

      if (isLoadMore) {
        setPsychologists((prev) => [...prev, ...results])
      } else {
        setPsychologists(results)
      }

      if (results.length < pageSize) {
        setHasMore(false)
      }
    })
  }

  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    handleSearch(filters, nextPage, true)
  }, [isPending, hasMore, page, filters])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, isPending])

  const handleFilterChange = useCallback((newFilters: PsychologistSearchFilters) => {
    setHasInteracted(true)
    setFilters(newFilters)
  }, [])

  const clearFilters = useCallback(() => {
    setHasInteracted(true)
    setFilters({
      specialties: [],
      maxPrice: 500,
      searchQuery: '',
    })
  }, [])

  return (
    <motion.div variants={containerVars} initial="initial" animate="animate" className="space-y-8">
      {/* Search Bar - Premium Hero Style */}
      <motion.div
        variants={itemVars}
        className="relative overflow-hidden bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-xl shadow-blue-900/5"
      >
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-orange-50/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-6 max-w-3xl mx-auto text-center">
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3 tracking-tight">
              Encontre seu psicólogo ideal
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 font-medium hidden sm:block">
              Conecte-se com profissionais qualificados para te apoiar em sua jornada de
              autoconhecimento e bem-estar.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-md group-hover:bg-blue-500/10 transition-colors duration-500" />
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300 z-10" />
            <Input
              value={filters.searchQuery}
              onChange={(e) => {
                setHasInteracted(true)
                setFilters({ ...filters, searchQuery: e.target.value })
              }}
              placeholder="Busque por especialidade ou nome..."
              className="pl-12 sm:pl-16 pr-4 sm:pr-6 h-12 sm:h-16 text-base sm:text-lg shadow-sm w-full rounded-full border-2 border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 relative z-0 bg-white/80 backdrop-blur-sm"
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
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-9">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(85vw,24rem)] overflow-y-auto">
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

          {isPending && psychologists.length === 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PsychologistCardSkeleton key={i} />
              ))}
            </div>
          ) : psychologists.length === 0 && !isPending ? (
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
            <>
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

              {/* Infinite Scroll Trigger */}
              <div ref={loaderRef} className="h-20 flex items-center justify-center mt-8">
                {isPending && hasMore && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Carregando mais...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
