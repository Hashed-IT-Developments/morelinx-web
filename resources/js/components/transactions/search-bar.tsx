import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ClipboardList, Receipt, Search } from 'lucide-react';
import React from 'react';

interface TransactionSeriesPreview {
    next_or: string;
    series_name: string;
    series_id: number;
    usage_percentage?: number;
    remaining_numbers?: number | null;
    is_near_limit?: boolean;
}

interface SearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
    onOpenQueue: () => void;
    seriesPreview?: TransactionSeriesPreview | null;
    isLoadingPreview?: boolean;
}

export default function SearchBar({
    search,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    onOpenQueue,
    seriesPreview,
    isLoadingPreview = false,
}: SearchBarProps) {
    return (
        <div className="mb-2 flex flex-col gap-3">
            {/* Series Preview Card */}
            {isLoadingPreview ? (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : !isLoadingPreview && !seriesPreview ? (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-red-600 text-white dark:bg-red-500">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-100">No Transaction Series Assigned</p>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    You cannot process payments. Please contact your administrator to assign a transaction series to your account.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : seriesPreview ? (
                <Card
                    className={`border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20 ${
                        seriesPreview.is_near_limit
                            ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20'
                            : seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75
                              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20'
                              : ''
                    }`}
                >
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded ${
                                        seriesPreview.is_near_limit
                                            ? 'bg-orange-600 text-white dark:bg-orange-500'
                                            : seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75
                                              ? 'bg-yellow-600 text-white dark:bg-yellow-500'
                                              : 'bg-blue-600 text-white dark:bg-blue-500'
                                    }`}
                                >
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            seriesPreview.is_near_limit
                                                ? 'text-orange-900 dark:text-orange-100'
                                                : seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75
                                                  ? 'text-yellow-900 dark:text-yellow-100'
                                                  : 'text-blue-900 dark:text-blue-100'
                                        }`}
                                    >
                                        Your Transaction Series
                                    </p>
                                    <p
                                        className={`text-xs ${
                                            seriesPreview.is_near_limit
                                                ? 'text-orange-700 dark:text-orange-300'
                                                : seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75
                                                  ? 'text-yellow-700 dark:text-yellow-300'
                                                  : 'text-blue-700 dark:text-blue-300'
                                        }`}
                                    >
                                        {seriesPreview.series_name} • Next OR:{' '}
                                        <span className="font-mono font-semibold">{seriesPreview.next_or}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Usage Percentage Badge */}
                                {seriesPreview.usage_percentage !== undefined ? (
                                    <Badge
                                        variant={
                                            seriesPreview.is_near_limit
                                                ? 'destructive'
                                                : seriesPreview.usage_percentage >= 75
                                                  ? 'default'
                                                  : 'secondary'
                                        }
                                        className={`text-xs ${
                                            !seriesPreview.is_near_limit && seriesPreview.usage_percentage >= 75
                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                : ''
                                        }`}
                                    >
                                        {seriesPreview.usage_percentage.toFixed(1)}% Used
                                    </Badge>
                                ) : null}

                                {/* Remaining Numbers Badge */}
                                {seriesPreview.remaining_numbers !== null && seriesPreview.remaining_numbers !== undefined ? (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                            seriesPreview.is_near_limit
                                                ? 'border-orange-600 text-orange-700 dark:text-orange-300'
                                                : seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75
                                                  ? 'border-yellow-600 text-yellow-700 dark:text-yellow-300'
                                                  : 'border-blue-600 text-blue-700 dark:text-blue-300'
                                        }`}
                                    >
                                        {seriesPreview.remaining_numbers.toLocaleString()} remaining
                                    </Badge>
                                ) : null}
                            </div>
                        </div>

                        {/* Warning Message for Near Limit */}
                        {seriesPreview.is_near_limit ? (
                            <div className="mt-2 flex items-start gap-2 rounded-md bg-orange-100 p-2 dark:bg-orange-950/40">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                <p className="text-xs text-orange-800 dark:text-orange-200">
                                    <span className="font-semibold">Warning:</span> Your series is running low on available numbers. Please contact
                                    your administrator to extend your range before it runs out.
                                </p>
                            </div>
                        ) : null}

                        {/* Warning Message for 75-90% */}
                        {!seriesPreview.is_near_limit && seriesPreview.usage_percentage !== undefined && seriesPreview.usage_percentage >= 75 ? (
                            <div className="mt-2 flex items-start gap-2 rounded-md bg-yellow-100 p-2 dark:bg-yellow-950/40">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    Your series is approaching its limit. Consider informing your administrator about extending your range.
                                </p>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {/* Search Bar and Buttons */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <form onSubmit={onSearchSubmit} className="w-96">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search by Account Number, Account Name, or Meter No..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-12 pr-12 pl-12 text-base font-semibold"
                            />
                            <Search className="absolute top-3 left-4 h-5 w-5 text-green-900 dark:text-green-400" />
                            {search && (
                                <button
                                    type="button"
                                    className="absolute top-3 right-12 flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                                    onClick={onSearchClear}
                                    aria-label="Clear search"
                                >
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded bg-green-900 text-white transition hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                    <Button variant="default" className="h-12" onClick={onOpenQueue}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Payment Queue
                    </Button>
                </div>
            </div>
        </div>
    );
}
