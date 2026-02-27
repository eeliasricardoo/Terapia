import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div>
                    <Skeleton className="h-[36px] w-[250px] mb-3 bg-slate-200" />
                    <Skeleton className="h-[20px] w-[320px] bg-slate-100" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-[40px] w-[190px] rounded-md bg-slate-200" />
                </div>
            </div>

            {/* Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Find Psychologist CTA Skeleton */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-sm overflow-hidden h-[240px]">
                    <CardContent className="p-8 relative">
                        <div className="max-w-2xl">
                            <Skeleton className="h-[36px] w-[400px] mb-4 bg-slate-200" />
                            <Skeleton className="h-[56px] w-[600px] mb-8 bg-slate-100" />
                            <Skeleton className="h-[48px] w-[220px] rounded-md bg-slate-200" />
                        </div>
                    </CardContent>
                </Card>

                {/* Next Session Area Skeleton */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-none shadow-sm overflow-hidden h-[300px]">
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
                <Card className="col-span-1 border-none shadow-sm h-[300px]">
                    <CardHeader>
                        <Skeleton className="h-[24px] w-[160px] bg-slate-200 mb-1" />
                        <Skeleton className="h-[16px] w-[220px] bg-slate-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2 h-32 mt-4">
                            <div className="flex flex-col justify-end items-center gap-2 h-full"><Skeleton className="h-[20%] w-[32px] rounded-t-md bg-amber-100" /><Skeleton className="h-[16px] w-[24px] bg-slate-100" /></div>
                            <div className="flex flex-col justify-end items-center gap-2 h-full"><Skeleton className="h-[40%] w-[32px] rounded-t-md bg-amber-200" /><Skeleton className="h-[16px] w-[24px] bg-slate-100" /></div>
                            <div className="flex flex-col justify-end items-center gap-2 h-full"><Skeleton className="h-[30%] w-[32px] rounded-t-md bg-emerald-100" /><Skeleton className="h-[16px] w-[24px] bg-slate-100" /></div>
                            <div className="flex flex-col justify-end items-center gap-2 h-full"><Skeleton className="h-[80%] w-[32px] rounded-t-md bg-emerald-300" /><Skeleton className="h-[16px] w-[24px] bg-slate-100" /></div>
                            <div className="flex flex-col justify-end items-center gap-2 h-full"><Skeleton className="h-[60%] w-[32px] rounded-t-md bg-amber-400" /><Skeleton className="h-[16px] w-[24px] bg-slate-100" /></div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
