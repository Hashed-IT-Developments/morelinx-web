import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QueueItem {
    id: number;
    account_number: string;
    full_name: string;
    identity: string;
    total_unpaid: number;
    unpaid_count: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PaymentQueueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectCustomer: (accountNumber: string) => void;
}

export default function PaymentQueueDialog({ open, onOpenChange, onSelectCustomer }: PaymentQueueDialogProps) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (open) {
            fetchQueue(1);
        }
    }, [open]);

    const fetchQueue = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await fetch(route('transactions.queue', { page }));
            const data = await response.json();
            setQueue(data.queue || []);
            setPagination(data.pagination || null);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch payment queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && pagination && page <= pagination.last_page) {
            fetchQueue(page);
        }
    };

    const handleSelectCustomer = (accountNumber: string) => {
        onSelectCustomer(accountNumber);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
                <DialogHeader>
                    <DialogTitle>Payment Queue</DialogTitle>
                    <DialogDescription>
                        {pagination
                            ? `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} customers with pending payments`
                            : 'Customers with pending payments. Use the search bar to find specific customers.'}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-900 dark:text-green-400" />
                    </div>
                ) : queue.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No customers with pending payments found.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 220px)' }}>
                            <div className="space-y-2 pb-2">
                                {queue.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="w-full cursor-pointer rounded-lg border border-gray-200 p-4 text-left transition hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:border-green-600 dark:hover:bg-green-900/10"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-1 items-start gap-3">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    {pagination ? (pagination.from || 0) + index : index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {item.full_name || item.identity}
                                                        </span>
                                                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                            {item.account_number}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <span>
                                                            {item.unpaid_count} unpaid bill{item.unpaid_count !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="font-semibold text-red-600 dark:text-red-400">
                                                            ₱{item.total_unpaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-4 shrink-0"
                                                onClick={() => handleSelectCustomer(item.account_number)}
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pagination.last_page || loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
