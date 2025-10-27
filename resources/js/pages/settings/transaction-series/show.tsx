import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction Series',
        href: '/transaction-series',
    },
    {
        title: 'Series Details',
        href: '#',
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
    creator?: {
        name: string;
    };
}

interface Statistics {
    usage_percentage: number;
    remaining_numbers: number | null;
    is_near_limit: boolean;
    has_reached_limit: boolean;
    transactions_count: number;
}

interface PageProps {
    series: TransactionSeries;
    statistics: Statistics;
    [key: string]: unknown;
}

export default function TransactionSeriesShow() {
    const { series, statistics } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction Series: ${series.series_name}`} />

            <div className="px-4 py-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href={route('transaction-series.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Series List
                            </Button>
                        </Link>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium">{series.series_name}</h3>
                            {series.is_active && (
                                <Badge variant="default" className="bg-green-600">
                                    Active
                                </Badge>
                            )}
                            {statistics.is_near_limit && <Badge variant="destructive">Near Limit</Badge>}
                            {statistics.has_reached_limit && <Badge variant="destructive">Limit Reached</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">Detailed information about this transaction series</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Series Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Series Configuration</CardTitle>
                                <CardDescription>Basic series settings and format</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Format Template</p>
                                    <p className="font-mono text-base">{series.format}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Start Number</p>
                                        <p className="text-base font-semibold">{series.start_number.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">End Number</p>
                                        <p className="text-base font-semibold">{series.end_number?.toLocaleString() || 'Unlimited'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Counter</p>
                                    <p className="text-base font-semibold">{series.current_number.toLocaleString()}</p>
                                </div>
                                {series.prefix && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Prefix</p>
                                        <p className="text-base">{series.prefix}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                                <CardDescription>Current usage and remaining capacity</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Transactions Created</p>
                                    <p className="text-2xl font-bold">{statistics.transactions_count.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Usage Percentage</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold">{statistics.usage_percentage.toFixed(2)}%</p>
                                        {statistics.is_near_limit && (
                                            <Badge variant="destructive" className="text-xs">
                                                Near Limit
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Remaining Numbers</p>
                                    <p className="text-2xl font-bold">{statistics.remaining_numbers?.toLocaleString() || 'Unlimited'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Effective Period */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Effective Period</CardTitle>
                                <CardDescription>When this series is valid</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Effective From</p>
                                    <p className="text-base">{new Date(series.effective_from).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Effective To</p>
                                    <p className="text-base">
                                        {series.effective_to ? new Date(series.effective_to).toLocaleDateString() : 'Ongoing'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    {series.is_active ? (
                                        <Badge variant="default" className="bg-green-600">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                                <CardDescription>Notes and metadata</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {series.creator && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created By</p>
                                        <p className="text-base">{series.creator.name}</p>
                                    </div>
                                )}
                                {series.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                        <p className="text-sm">{series.notes}</p>
                                    </div>
                                )}
                                {!series.notes && !series.creator && (
                                    <p className="text-sm text-muted-foreground">No additional information available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Example OR Numbers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Example OR Numbers</CardTitle>
                            <CardDescription>Sample OR numbers that will be generated from this series</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="rounded bg-muted p-3">
                                    Next OR Number:{' '}
                                    <span className="font-bold">
                                        OR-{new Date().toISOString().slice(0, 7).replace('-', '')}-
                                        {String(series.current_number + 1).padStart(6, '0')}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Format: {series.format}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
