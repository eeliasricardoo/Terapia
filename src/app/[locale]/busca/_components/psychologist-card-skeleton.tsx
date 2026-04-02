import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PsychologistCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200/60 rounded-3xl flex flex-col bg-white h-full">
      <CardContent className="p-0 flex flex-col flex-1">
        <div className="p-6 md:p-8 flex flex-col flex-1">
          <div className="flex gap-5 mb-5">
            <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />

            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-3 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 md:px-8 md:py-6 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between mt-auto">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-11 w-32 rounded-full" />
      </CardFooter>
    </Card>
  )
}
