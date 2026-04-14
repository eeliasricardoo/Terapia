'use client'

import { useTranslations } from 'next-intl'

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
import { useRef, useCallback, useState, useTransition, useEffect } from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'
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
  const t = useTranslations('SearchPage')
  const { isAuthenticated } = useAuth()
  const [psychologists, setPsychologists] =
    useState<PsychologistWithProfile[]>(initialPsychologists)
  const [total, setTotal] = useState(initialPsychologists.length)
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<PsychologistSearchFilters>({
    specialties: [],
    maxPrice: 500,
    searchQuery: '',
    genders: [],
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPsychologists.length >= 12)
  const [hasInteracted, setHasInteracted] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const pageSize = 12

  // If no initial results were returned (e.g. cache miss or no verified psychologists),
  // trigger a fresh search on mount so the user sees results without needing to interact.
  useEffect(() => {
    if (initialPsychologists.length === 0) {
      handleSearch(
        { specialties: [], healthInsurances: [], searchQuery: '', genders: [] },
        1,
        false
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trigger search only when filters actually change (not on mount)
  useEffect(() => {
    if (!hasInteracted) return // Skip initial mount

    let cancelled = false

    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      setHasMore(true)

      startTransition(async () => {
        const response = await searchPsychologists({
          ...filters,
          page: 1,
          pageSize,
        })
        if (cancelled) return // Discard stale response
        if (!response.success) return
        const { results, total: newTotal } = response.data
        setTotal(newTotal)
        setPsychologists(results)
        if (results.length < pageSize) setHasMore(false)
      })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(delayDebounceFn)
    }
  }, [filters, hasInteracted])

  const handleSearch = async (
    currentFilters: PsychologistSearchFilters,
    currentPage: number,
    isLoadMore: boolean
  ) => {
    startTransition(async () => {
      const response = await searchPsychologists({
        ...currentFilters,
        page: currentPage,
        pageSize,
      })

      if (!response.success) return
      const { results, total: newTotal } = response.data

      setTotal(newTotal)

      if (isLoadMore) {
        setPsychologists((prev) => {
          // Filter out any results that are already in the previous list to avoid duplicate keys
          const newResults = results.filter((newPsych) => !prev.some((p) => p.id === newPsych.id))
          return [...prev, ...newResults]
        })
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
      healthInsurances: [],
      maxPrice: 500,
      searchQuery: '',
      genders: [],
    })
  }, [])

  return (
    <motion.div variants={containerVars} initial="initial" animate="animate" className="space-y-4">
      {/* Results Header - Span across Filters and Grid */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-2xl mb-6">
        <p className="text-sm text-slate-500 font-medium">
          {t('header.titlePart1')}{' '}
          <span className="font-black text-slate-900 bg-sentirz-teal-pastel/50 px-2 py-0.5 rounded-md">
            {t('header.titlePart2', { count: total })}
          </span>{' '}
          {t('header.titlePart3')}
        </p>

        <div className="hidden sm:flex items-center gap-3 bg-white p-1 rounded-full border border-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">
            {t('sort.label')}
          </span>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-full bg-slate-50 border-none shadow-none font-bold text-slate-700">
              <SelectValue placeholder={t('sort.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t('sort.relevance')}</SelectItem>
              <SelectItem value="price_asc">{t('sort.priceAsc')}</SelectItem>
              <SelectItem value="price_desc">{t('sort.priceDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filters Trigger */}
        <div className="lg:hidden flex justify-between items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9 rounded-full bg-white shadow-sm"
              >
                <Filter className="h-4 w-4" />
                {t('filters.title')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(85vw,24rem)] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t('filters.title')}</SheetTitle>
                <SheetDescription>{t('filters.description')}</SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>

          <Select defaultValue="relevance">
            <SelectTrigger className="w-[140px] sm:w-[180px] h-9 rounded-full bg-white shadow-sm">
              <SelectValue placeholder={t('sort.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t('sort.relevance')}</SelectItem>
              <SelectItem value="price_asc">{t('sort.priceAsc')}</SelectItem>
              <SelectItem value="price_desc">{t('sort.priceDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Filters Sidebar */}
        <motion.aside variants={itemVars} className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/20 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-black text-xs flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <ListFilter className="w-4 h-4 text-primary" />
                {t('filters.title')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-[10px] uppercase font-black text-slate-400 hover:text-slate-900 hover:bg-slate-100 px-3 rounded-full transition-colors"
              >
                {t('filters.clear')}
              </Button>
            </div>
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </motion.aside>

        {/* Results Grid */}
        <div className="flex-1">
          {isPending && psychologists.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PsychologistCardSkeleton key={i} />
              ))}
            </div>
          ) : psychologists.length === 0 && !isPending ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('empty.title')}</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                {t('empty.description')}
              </p>
              <Button
                onClick={clearFilters}
                className="mt-5 rounded-full px-8 text-xs font-bold"
                variant="outline"
              >
                {t('empty.button')}
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key="results-grid"
                  variants={containerVars}
                  initial="initial"
                  animate="animate"
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {psychologists.map((psychologist) => (
                    <motion.div
                      key={psychologist.id}
                      variants={itemVars}
                      layout
                      initial="initial"
                      animate="animate"
                      exit="initial"
                      className="h-full"
                    >
                      <PsychologistCard psychologist={psychologist} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Infinite Scroll Trigger */}
              <div ref={loaderRef} className="h-20 flex items-center justify-center mt-8">
                {isPending && hasMore && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    {t('loadingMore')}
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
