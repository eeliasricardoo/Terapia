import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <Skeleton className="h-[36px] w-[250px] mb-2 bg-slate-200" />
          <Skeleton className="h-[20px] w-[320px] bg-slate-100" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Skeleton className="h-[40px] w-[190px] rounded-md bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-8">
          {/* Find Psychologist CTA Skeleton */}
          <Card className="border-none shadow-lg overflow-hidden h-[256px]">
            <CardContent className="p-8 relative">
              <div className="max-w-2xl">
                <Skeleton className="h-[36px] w-[80%] max-w-[400px] mb-4 bg-slate-200" />
                <Skeleton className="h-[56px] w-[100%] max-w-[600px] mb-8 bg-slate-100" />
                <Skeleton className="h-[48px] w-[220px] rounded-md bg-slate-200" />
              </div>
            </CardContent>
          </Card>

          {/* Next Session Area Skeleton */}
          <Card className="border-none shadow-md overflow-hidden min-h-[300px]">
            <div className="flex flex-col md:flex-row h-full">
              <div className="p-8 flex-1">
                <Skeleton className="h-[24px] w-[120px] rounded-full mb-4 bg-slate-200" />
                <Skeleton className="h-[32px] w-[200px] mb-2 bg-slate-200" />
                <Skeleton className="h-[20px] w-[160px] mb-6 bg-slate-100" />

                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="h-[48px] w-[48px] rounded-full bg-slate-200" />
                  <div>
                    <Skeleton className="h-[20px] w-[120px] mb-1 bg-slate-200" />
                    <Skeleton className="h-[16px] w-[100px] bg-slate-100" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Skeleton className="h-[40px] w-[90px] rounded-md bg-slate-200" />
                  <Skeleton className="h-[40px] w-[120px] rounded-md bg-slate-200" />
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-slate-50 min-h-[200px]" />
            </div>
          </Card>

          {/* Mood Tracker Area Skeleton */}
          <Card className="border-none shadow-sm h-[300px]">
            <CardHeader>
              <Skeleton className="h-[24px] w-[160px] bg-slate-200 mb-1" />
              <Skeleton className="h-[16px] w-[220px] bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 h-32 mt-4">
                <div className="flex flex-col justify-end items-center gap-2 h-full">
                  <Skeleton className="h-[20%] w-[32px] rounded-t-md bg-slate-200" />
                  <Skeleton className="h-[16px] w-[24px] bg-slate-100" />
                </div>
                <div className="flex flex-col justify-end items-center gap-2 h-full">
                  <Skeleton className="h-[40%] w-[32px] rounded-t-md bg-slate-200" />
                  <Skeleton className="h-[16px] w-[24px] bg-slate-100" />
                </div>
                <div className="flex flex-col justify-end items-center gap-2 h-full">
                  <Skeleton className="h-[30%] w-[32px] rounded-t-md bg-slate-200" />
                  <Skeleton className="h-[16px] w-[24px] bg-slate-100" />
                </div>
                <div className="flex flex-col justify-end items-center gap-2 h-full">
                  <Skeleton className="h-[80%] w-[32px] rounded-t-md bg-slate-200" />
                  <Skeleton className="h-[16px] w-[24px] bg-slate-100" />
                </div>
                <div className="flex flex-col justify-end items-center gap-2 h-full">
                  <Skeleton className="h-[60%] w-[32px] rounded-t-md bg-slate-200" />
                  <Skeleton className="h-[16px] w-[24px] bg-slate-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-8">
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-6">
            <Card className="border-none shadow-sm h-[200px]">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-200 mb-4" />
                <Skeleton className="h-[20px] w-[150px] mb-2 bg-slate-200" />
                <Skeleton className="h-[16px] w-[100px] mb-4 bg-slate-100" />
                <Skeleton className="h-[40px] w-full bg-slate-200" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm h-[200px]">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-200 mb-4" />
                <Skeleton className="h-[20px] w-[150px] mb-2 bg-slate-200" />
                <Skeleton className="h-[16px] w-[100px] mb-4 bg-slate-100" />
                <Skeleton className="h-[40px] w-full bg-slate-200" />
              </CardContent>
            </Card>
          </div>

          {/* Recent History Skeleton */}
          <Card className="border-none shadow-sm min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-50">
              <div>
                <Skeleton className="h-[24px] w-[160px] mb-2 bg-slate-200" />
                <Skeleton className="h-[16px] w-[220px] bg-slate-100" />
              </div>
              <Skeleton className="h-[32px] w-[80px] bg-slate-200" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                      <Skeleton className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-[20px] w-[60%] mb-1 bg-slate-200" />
                        <Skeleton className="h-[16px] w-[40%] bg-slate-100" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full bg-slate-200 shrink-0 ml-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
