import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
    type?: 'pie' | 'bar' | 'line' | 'area';
}

export default function ChartSkeleton({ type = 'bar' }: ChartSkeletonProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                    {type === 'pie' && <PieSkeleton />}
                    {type === 'bar' && <BarSkeleton />}
                    {type === 'line' && <LineSkeleton />}
                    {type === 'area' && <AreaSkeleton />}
                </div>
            </CardContent>
        </Card>
    );
}

function PieSkeleton() {
    return (
        <div className="flex w-full flex-col items-center gap-6">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    );
}

function BarSkeleton() {
    return (
        <div className="flex h-full w-full items-end gap-3 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-full" style={{ height: `${40 + i * 25}px` }} />
            ))}
        </div>
    );
}

function LineSkeleton() {
    return (
        <div className="relative h-full w-full">
            <Skeleton className="absolute bottom-8 left-0 h-0.5 w-full" />
            <div className="flex h-full items-end justify-between px-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="w-2 rounded-full" style={{ height: `${60 + (i % 3) * 40}px` }} />
                ))}
            </div>
        </div>
    );
}

function AreaSkeleton() {
    return (
        <div className="relative h-full w-full px-6">
            <div className="absolute inset-0 flex flex-col justify-between py-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-px w-full opacity-40" />
                ))}
            </div>

            <Skeleton className="absolute bottom-8 left-0 h-0.5 w-full" />

            <div className="absolute top-6 right-6 bottom-8 left-6">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                    <path
                        d="
              M 0 100
              L 0 0
              C 20 10, 35 40, 50 70
              C 60 85, 70 95, 100 100
              L 100 100
              Z
            "
                        fill="hsl(var(--muted))"
                        fillOpacity="0.10"
                    />

                    <path
                        d="
              M 0 100
              L 0 0
              C 20 10, 35 40, 50 70
              C 60 85, 70 95, 100 100
              L 100 100
              Z
            "
                        fill="hsl(var(--muted))"
                        fillOpacity="0.03"
                    />
                </svg>
            </div>
        </div>
    );
}
