import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
              <Skeleton className="h-8 w-40 rounded-lg" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3 rounded-md" />
                      <Skeleton className="h-4 w-1/4 rounded-md opacity-70" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar/Stats Section */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-3xl p-8 space-y-6">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="space-y-10 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2 rounded-sm" />
                    <Skeleton className="h-3 w-1/3 rounded-sm opacity-50" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-2xl mt-4" />
          </Card>
        </div>
      </div>
    </div>
  )
}
