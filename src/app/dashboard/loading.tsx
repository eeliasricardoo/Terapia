
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-64 bg-slate-200/60" />
                <Skeleton className="h-4 w-96 bg-slate-200/60" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24 bg-slate-100" />
                            <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-1 bg-slate-200" />
                        <Skeleton className="h-3 w-32 bg-slate-100" />
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <Skeleton className="h-6 w-32 mb-6 bg-slate-200" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full bg-slate-100" />
                                    <Skeleton className="h-3 w-2/3 bg-slate-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-3 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <Skeleton className="h-6 w-32 mb-4 bg-slate-200" />
                        <div className="grid grid-cols-7 gap-2">
                            {[...Array(35)].map((_, i) => (
                                <Skeleton key={i} className="h-8 w-8 rounded-md bg-slate-50" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
