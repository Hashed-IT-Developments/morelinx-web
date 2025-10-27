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
import { AlertCircle, CheckCircle2, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

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
    [key: string]: unknown;
}

export default function TransactionSeriesIndex() {
    const { series, nearLimitWarning, activeSeries } = usePage<PageProps>().props;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [activateDialogOpen, setActivateDialogOpen] = useState(false);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        series_name: '',
        start_number: '1',
        end_number: '999999',
        format: 'OR-{YEAR}{MONTH}-{NUMBER:6}',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        notes: '',
        is_active: false,
    });

    const handleCreateSeries = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('transaction-series.store'), formData, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                setFormData({
                    series_name: '',
                    start_number: '1',
                    end_number: '999999',
                    format: 'OR-{YEAR}{MONTH}-{NUMBER:6}',
                    effective_from: new Date().toISOString().split('T')[0],
                    effective_to: '',
                    notes: '',
                    is_active: false,
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
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Series" />

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

                    {/* Active Series Card */}
                    {activeSeries && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Active Series</span>
                                    <Badge variant="default" className="bg-green-600">
                                        Active
                                    </Badge>
                                </CardTitle>
                                <CardDescription>Currently generating OR numbers from this series</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Series Name</p>
                                        <p className="text-base font-semibold">{activeSeries.series_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Format</p>
                                        <p className="font-mono text-sm">{activeSeries.format}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Current Number</p>
                                        <p className="text-base font-semibold">{activeSeries.current_number.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Range</p>
                                        <p className="text-base">
                                            {activeSeries.start_number.toLocaleString()} - {activeSeries.end_number?.toLocaleString() || '∞'}
                                        </p>
                                    </div>
                                    {activeSeries.statistics && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Usage</p>
                                                <p className="text-base">
                                                    {activeSeries.statistics.usage_percentage.toFixed(2)}%
                                                    {activeSeries.statistics.is_near_limit && (
                                                        <Badge variant="destructive" className="ml-2">
                                                            Near Limit
                                                        </Badge>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                                                <p className="text-base">
                                                    {activeSeries.statistics.remaining_numbers?.toLocaleString() || 'Unlimited'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Effective Period</p>
                                        <p className="text-sm">
                                            {new Date(activeSeries.effective_from).toLocaleDateString()} -{' '}
                                            {activeSeries.effective_to ? new Date(activeSeries.effective_to).toLocaleDateString() : 'Ongoing'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                                        <p className="text-base font-semibold">{activeSeries.transactions_count || 0}</p>
                                    </div>
                                </div>
                                {activeSeries.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                        <p className="text-sm">{activeSeries.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
                                <li>Only one series can be active at a time</li>
                                <li>OR numbers are generated automatically in sequential order</li>
                                <li>Format example: OR-202510-000001 (OR-YYYYMM-NNNNNN)</li>
                                <li>You'll be warned when a series reaches 90% capacity</li>
                                <li>Create new series for yearly changes or when approaching limits</li>
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
                                        placeholder="e.g., 2025 Main Series"
                                        required
                                    />
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
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="format">Format Template *</Label>
                                    <Input
                                        id="format"
                                        value={formData.format}
                                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                        placeholder="OR-{YEAR}{MONTH}-{NUMBER:6}"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Available placeholders: {'{YEAR}'}, {'{MONTH}'}, {'{NUMBER}'} or {'{NUMBER:6}'}
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
                                Are you sure you want to activate this series? This will deactivate all other series and start using this one for
                                generating new OR numbers.
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
