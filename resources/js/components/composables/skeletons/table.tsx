import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonRow({ columns = 4, className = '' }) {
    return (
        <div className={`flex space-x-2 ${className}`}>
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-1/4 rounded" />
            ))}
        </div>
    );
}
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="relative w-full rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                </div>
                <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            <div className="mb-2 flex">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="mr-2 h-4 w-1/4 rounded last:mr-0" />
                ))}
            </div>

            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <SkeletonRow key={i} columns={columns} />
                ))}
            </div>
        </div>
    );
}
