import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Plus, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction Series',
        href: '/transaction-series',
    },
];

interface TransactionSeries {
    id: number;
    series_name: string;
    prefix: string | null;
    current_number: number;
    start_number: number;
    end_number: number | null;
    format: string;
    is_active: boolean;
    effective_from: string;
    effective_to: string | null;
    notes: string | null;
    transactions_count?: number;
    statistics?: {
        usage_percentage: number;
        remaining_numbers: number | null;
        is_near_limit: boolean;
        has_reached_limit: boolean;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface PageProps {
    series: {
        data: TransactionSeries[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    nearLimitWarning: {
        series_name: string;
        usage_percentage: number;
        remaining_numbers: number;
    } | null;
    activeSeries: TransactionSeries | null;
    treasuryStaff?: User[];
    flash?: FlashMessages;
    [key: string]: unknown;
}

export default function TransactionSeriesIndex() {
    const page = usePage<PageProps>();
    const { series, nearLimitWarning } = page.props;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [activateDialogOpen, setActivateDialogOpen] = useState(false);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
    const [suggestedRange, setSuggestedRange] = useState<{ start_number: number; end_number: number } | null>(null);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const [formData, setFormData] = useState({
        series_name: '',
        prefix: 'CR',
        start_number: '1',
        end_number: '999999999999',
        format: '{PREFIX}{NUMBER:10}',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        notes: '',
        is_active: false,
    });
    const [maxEndNumber, setMaxEndNumber] = useState<number>(999999999999);

    // Calculate max end_number based on format
    const calculateMaxEndNumber = (format: string): number => {
        const match = format.match(/\{NUMBER:(\d+)\}/);
        if (match) {
            const digits = Math.min(parseInt(match[1], 10), 12); // Cap at 12 digits max
            return parseInt('9'.repeat(digits), 10);
        }
        return 999999999999; // Default max (12 digits)
    };

    // Handle flash messages
    useEffect(() => {
        const flash = page.props.flash;

        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [page.props.flash]);

    // Update max end_number when format changes
    useEffect(() => {
        const max = calculateMaxEndNumber(formData.format);
        setMaxEndNumber(max);

        // If current end_number exceeds new max, cap it
        if (formData.end_number) {
            const currentEndNumber = parseInt(formData.end_number, 10);
            if (currentEndNumber > max) {
                setFormData((prev) => ({ ...prev, end_number: max.toString() }));
            }
        }
    }, [formData.format, formData.end_number]);

    // Fetch suggested range when dialog opens
    useEffect(() => {
        if (createDialogOpen) {
            fetchSuggestedRange();
        }
    }, [createDialogOpen]);

    const fetchSuggestedRange = async () => {
        try {
            setLoadingSuggestion(true);
            const response = await axios.get(route('transaction-series.suggest-range'));
            setSuggestedRange(response.data);
        } catch (error) {
            console.error('Failed to fetch suggested range:', error);
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const applySuggestedRange = () => {
        if (suggestedRange) {
            setFormData({
                ...formData,
                start_number: suggestedRange.start_number.toString(),
                end_number: suggestedRange.end_number.toString(),
            });
        }
    };

    const handleCreateSeries = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('transaction-series.store'), formData, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                setFormData({
                    series_name: '',
                    prefix: 'CR',
                    start_number: '1',
                    end_number: '9999999999',
                    format: '{PREFIX}{NUMBER:10}',
                    effective_from: new Date().toISOString().split('T')[0],
                    effective_to: '',
                    notes: '',
                    is_active: false,
                });
                toast.success('Transaction series created successfully');
            },
            onError: (errors) => {
                // Display validation errors using toast
                Object.entries(errors).forEach(([, messages]) => {
                    const errorMessage = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(errorMessage);
                });
            },
        });
    };

    const handleActivate = (seriesId: number) => {
        setSelectedSeriesId(seriesId);
        setActivateDialogOpen(true);
    };

    const confirmActivate = () => {
        if (selectedSeriesId) {
            router.post(
                route('transaction-series.activate', selectedSeriesId),
                {},
                {
                    onSuccess: () => {
                        setActivateDialogOpen(false);
                        setSelectedSeriesId(null);
                        toast.success('Transaction series activated successfully');
                    },
                    onError: (errors) => {
                        // Display validation errors using toast
                        Object.entries(errors).forEach(([, messages]) => {
                            const errorMessage = Array.isArray(messages) ? messages[0] : messages;
                            toast.error(errorMessage);
                        });
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Series" />
            <Toaster position="top-right" richColors />

            <div className="px-4 py-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Transaction Series Management</h3>
                        <p className="text-sm text-muted-foreground">Manage BIR-compliant Official Receipt (OR) number series for transactions.</p>
                    </div>

                    {/* Warning Alert */}
                    {nearLimitWarning && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Series Near Limit!</AlertTitle>
                            <AlertDescription>
                                Your active series "{nearLimitWarning.series_name}" is {nearLimitWarning.usage_percentage.toFixed(1)}% used. Only{' '}
                                {nearLimitWarning.remaining_numbers} numbers remaining. Please create and activate a new series soon.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* All Series List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>All Series</span>
                                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Series
                                </Button>
                            </CardTitle>
                            <CardDescription>View and manage all transaction series</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {series.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{item.series_name}</h4>
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
                                                {item.statistics?.is_near_limit && <Badge variant="destructive">Near Limit</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Format: <span className="font-mono">{item.format}</span> | Current:{' '}
                                                {item.current_number.toLocaleString()} | Range: {item.start_number.toLocaleString()} -{' '}
                                                {item.end_number?.toLocaleString() || '∞'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Effective: {new Date(item.effective_from).toLocaleDateString()} -{' '}
                                                {item.effective_to ? new Date(item.effective_to).toLocaleDateString() : 'Ongoing'} |{' '}
                                                {item.transactions_count || 0} transactions
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!item.is_active && (
                                                <Button size="sm" variant="outline" onClick={() => handleActivate(item.id)}>
                                                    Activate
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={route('transaction-series.show', item.id)}>View</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {series.data.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">No transaction series found.</p>
                                    <Button className="mt-4" size="sm" onClick={() => setCreateDialogOpen(true)}>
                                        Create Your First Series
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">About Transaction Series</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                <strong>Transaction Series</strong> manage BIR-compliant Official Receipt (OR) numbers for all transactions in your
                                system.
                            </p>
                            <ul className="list-inside list-disc space-y-1">
                                <li>Multiple series can be active for different cashiers</li>
                                <li>Each cashier gets their own number range</li>
                                <li>OR numbers are generated automatically in sequential order</li>
                                <li>Format example: CR0000000001 or CR000000000001</li>
                                <li>You'll be warned when a series reaches 90% capacity</li>
                                <li>Assign series to treasury staff for multi-cashier support</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Create Series Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Transaction Series</DialogTitle>
                            <DialogDescription>
                                Configure a new BIR-compliant OR number series. Only one series can be active at a time.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSeries}>
                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="series_name">Series Name *</Label>
                                    <Input
                                        id="series_name"
                                        value={formData.series_name}
                                        onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                                        placeholder="e.g., Cashier 1 Series"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="prefix">Prefix *</Label>
                                    <Input
                                        id="prefix"
                                        value={formData.prefix}
                                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                        placeholder="e.g., CR, OR"
                                        maxLength={10}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used in {'{PREFIX}'} placeholder in format. Example: "CR" will produce CR0000000001
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="start_number">Start Number *</Label>
                                        <Input
                                            id="start_number"
                                            type="number"
                                            value={formData.start_number}
                                            onChange={(e) => setFormData({ ...formData, start_number: e.target.value })}
                                            required
                                            min="1"
                                            max="999999999999999"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_number">End Number</Label>
                                        <Input
                                            id="end_number"
                                            type="number"
                                            value={formData.end_number}
                                            onChange={(e) => setFormData({ ...formData, end_number: e.target.value })}
                                            placeholder="Leave empty for unlimited"
                                            max={maxEndNumber}
                                        />
                                        <p className="text-xs text-muted-foreground">Max for current format: {maxEndNumber.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Suggested Range */}
                                {loadingSuggestion ? (
                                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                                        <Sparkles className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
                                        <AlertTitle className="text-blue-900 dark:text-blue-100">Loading Suggestion...</AlertTitle>
                                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                                            Analyzing existing series to suggest optimal range...
                                        </AlertDescription>
                                    </Alert>
                                ) : suggestedRange ? (
                                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <AlertTitle className="text-blue-900 dark:text-blue-100">Suggested Range</AlertTitle>
                                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                                            <div className="mb-2">
                                                Based on existing series, we suggest:
                                                <div className="mt-1 font-mono font-semibold">
                                                    {suggestedRange.start_number.toLocaleString()} - {suggestedRange.end_number.toLocaleString()}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={applySuggestedRange}
                                                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                            >
                                                Apply Suggested Range
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                ) : null}

                                <div className="grid gap-2">
                                    <Label htmlFor="format">Format Template *</Label>
                                    <Input
                                        id="format"
                                        value={formData.format}
                                        onChange={(e) => {
                                            // Validate NUMBER placeholder to max 12 digits
                                            let value = e.target.value;
                                            const match = value.match(/\{NUMBER:(\d+)\}/);
                                            if (match && parseInt(match[1]) > 12) {
                                                value = value.replace(/\{NUMBER:\d+\}/, '{NUMBER:10}');
                                            }
                                            setFormData({ ...formData, format: value });
                                        }}
                                        placeholder="{PREFIX}{NUMBER:10}"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Available placeholders: {'{PREFIX}'}, {'{NUMBER:X}'} (max 10 digits). Example: {'{PREFIX}{NUMBER:10}'} →
                                        OR0000000001
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="effective_from">Effective From *</Label>
                                        <Input
                                            id="effective_from"
                                            type="date"
                                            value={formData.effective_from}
                                            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="effective_to">Effective To</Label>
                                        <Input
                                            id="effective_to"
                                            type="date"
                                            value={formData.effective_to}
                                            onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Optional notes about this series"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Activate this series immediately (will deactivate current active series)
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Series</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Activate Confirmation Dialog */}
                <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Activate Transaction Series</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to activate this series? This will start using this series for generating new OR numbers for the
                                assigned cashier.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmActivate}>Activate</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
