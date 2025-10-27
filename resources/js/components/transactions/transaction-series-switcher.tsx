import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TransactionSeries {
    id: number;
    series_name: string;
    format: string;
    current_number: number;
    start_number: number;
    end_number: number | null;
    is_active: boolean;
    effective_from: string;
    effective_to: string | null;
    transactions_count: number;
    statistics?: {
        usage_percentage: number;
        is_near_limit: boolean;
        remaining_numbers: number;
    };
}

interface TransactionSeriesSwitcherProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TransactionSeriesSwitcher({ open, onOpenChange }: TransactionSeriesSwitcherProps) {
    const [series, setSeries] = useState<TransactionSeries[]>([]);
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            fetchSeries();
        }
    }, [open]);

    const fetchSeries = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('transaction-series.index'));
            const data = response.data;

            // Handle paginated response
            if (data.data && Array.isArray(data.data)) {
                setSeries(data.data);
            } else if (Array.isArray(data)) {
                setSeries(data);
            } else {
                console.error('Unexpected data format:', data);
                throw new Error('Invalid data format received');
            }
        } catch (error) {
            console.error('Failed to fetch transaction series:', error);
            toast.error('Failed to load transaction series');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (seriesId: number) => {
        setActivating(seriesId);
        try {
            router.post(
                route('transaction-series.activate', seriesId),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Transaction series activated successfully');
                        fetchSeries(); // Refresh the list
                    },
                    onError: (errors) => {
                        toast.error('Failed to activate series', {
                            description: errors.error || 'An error occurred',
                        });
                    },
                    onFinish: () => {
                        setActivating(null);
                    },
                },
            );
        } catch (error) {
            console.error('Failed to activate transaction series:', error);
            toast.error('Failed to activate series');
            setActivating(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
                <DialogHeader>
                    <DialogTitle>Transaction Series Manager</DialogTitle>
                    <DialogDescription>Switch between transaction series to control OR number generation</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-900 dark:text-green-400" />
                    </div>
                ) : series.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No transaction series found.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                        <div className="space-y-3 pb-2">
                            {series.map((item) => (
                                <div
                                    key={item.id}
                                    className={`rounded-lg border p-4 transition-colors ${
                                        item.is_active
                                            ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/10'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.series_name}</h4>
                                                {item.is_active ? (
                                                    <Badge variant="default" className="bg-green-600">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                                {item.statistics?.is_near_limit && (
                                                    <Badge variant="destructive">
                                                        <AlertCircle className="mr-1 h-3 w-3" />
                                                        Near Limit
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <div className="mb-1">
                                                    <span className="font-medium">Format:</span>{' '}
                                                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{item.format}</code>
                                                </div>
                                                <div className="mb-1">
                                                    <span className="font-medium">Current Number:</span> {item.current_number.toLocaleString()} |
                                                    <span className="font-medium"> Range:</span> {item.start_number.toLocaleString()} -{' '}
                                                    {item.end_number?.toLocaleString() || '∞'}
                                                </div>
                                                <div className="mb-1">
                                                    <span className="font-medium">Effective:</span>{' '}
                                                    {new Date(item.effective_from).toLocaleDateString()} -{' '}
                                                    {item.effective_to ? new Date(item.effective_to).toLocaleDateString() : 'Ongoing'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Transactions:</span> {item.transactions_count || 0}
                                                    {item.statistics && (
                                                        <>
                                                            {' | '}
                                                            <span className="font-medium">Usage:</span> {item.statistics.usage_percentage.toFixed(1)}%
                                                            {' | '}
                                                            <span className="font-medium">Remaining:</span>{' '}
                                                            {item.statistics.remaining_numbers.toLocaleString()}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center">
                                            {!item.is_active && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleActivate(item.id)}
                                                    disabled={activating !== null}
                                                    className="bg-green-900 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
                                                >
                                                    {activating === item.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Activating...
                                                        </>
                                                    ) : (
                                                        'Activate'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Note: Only one series can be active at a time. Activating a series will automatically deactivate the current active series.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
