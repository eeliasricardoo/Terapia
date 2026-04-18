import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PsychologistListItemSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200/60 rounded-2xl bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Left: Avatar + Info */}
          <div className="flex-1 p-4 sm:p-5 flex gap-3 sm:gap-4">
            <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex-shrink-0" />

            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-24" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              <Skeleton className="h-3.5 w-full hidden sm:block" />
            </div>
          </div>

          {/* Right: Price + CTA */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-3 px-4 pb-4 sm:p-5 sm:border-l border-t sm:border-t-0 border-slate-100 bg-slate-50/30 sm:min-w-[160px]">
            <div className="flex flex-col items-center space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
