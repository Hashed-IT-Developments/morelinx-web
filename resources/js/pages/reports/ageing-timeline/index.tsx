import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface AgeingRowData {
    range_index: number;
    min_days: number | null;
    max_days: number | null;
    stages: Record<string, number>;
    total: number;
}

interface Application {
    id: number;
    account_number: string;
    customer_name: string;
    status: string;
    days_elapsed: number;
    days_elapsed_human: string;
    cause_of_delay: {
        delay_source: string;
        remarks: string | null;
    } | null;
}

interface AgeingTimelinePageProps {
    ageingDataBelow30: AgeingRowData[];
    ageingData30AndAbove: AgeingRowData[];
    grandTotalBelow30: number;
    grandTotal30AndAbove: number;
    stages: string[];
    [key: string]: unknown;
}

const STAGE_LABELS: Record<string, string> = {
    during_application: 'Application in Process',
    forwarded_to_inspector: 'Forwarded To Inspector',
    inspection_date_du: 'For Inspection (DU)',
    inspection_date_customer: 'For Inspection (Customer)',
    inspection_uploaded_to_system: 'Inspection Uploaded',
    paid_to_cashier: 'Paid To Cashier',
    contract_signed: 'Contract Signed',
    assigned_to_lineman: 'Assigned To Lineman',
    downloaded_to_lineman: 'Downloaded To Lineman',
    installed_date: 'Installed Date',
};

// Color coding thresholds for application counts
const COLOR_THRESHOLDS = {
    LOW: 5,
    MODERATE: 15,
} as const;

function formatAgeRangeLabel(minDays: number | null, maxDays: number | null): string {
    if (minDays === null) return 'TOTAL';

    // For ranges below 30 days
    if (maxDays !== null && maxDays < 30) {
        if (minDays === 0) return 'Today';
        return `${minDays} ${minDays === 1 ? 'day' : 'days'}`;
    }

    // For ranges 30 days and above
    if (maxDays === null) return 'More than 1 year';
    return `${minDays} ${minDays === 1 ? 'day' : 'days'}`;
}

function getStageLabel(stage: string): string {
    return STAGE_LABELS[stage] || stage;
}

function AgeingTable({
    ageingData,
    stages,
    onCellClick,
    rangeOffset = 0,
}: {
    ageingData: AgeingRowData[];
    stages: string[];
    onCellClick: (stage: string, rangeIndex: number, count: number, minDays: number | null, maxDays: number | null) => void;
    rangeOffset?: number;
}) {
    const getCellColor = (count: number, isTotal: boolean = false) => {
        if (isTotal) return 'bg-gray-100 dark:bg-gray-800';
        if (count === 0) return 'bg-white dark:bg-gray-900';
        if (count <= COLOR_THRESHOLDS.LOW) return 'bg-green-50 dark:bg-green-900/20';
        if (count <= COLOR_THRESHOLDS.MODERATE) return 'bg-yellow-50 dark:bg-yellow-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };

    const getTextColor = (count: number) => {
        if (count === 0) return 'text-gray-400';
        if (count <= COLOR_THRESHOLDS.LOW) return 'text-green-700 dark:text-green-400';
        if (count <= COLOR_THRESHOLDS.MODERATE) return 'text-yellow-700 dark:text-yellow-400';
        return 'text-red-700 dark:text-red-400';
    };

    const getHoverRingColor = (count: number) => {
        if (count <= COLOR_THRESHOLDS.LOW) return 'hover:ring-green-200';
        if (count <= COLOR_THRESHOLDS.MODERATE) return 'hover:ring-yellow-200';
        return 'hover:ring-red-200';
    };

    return (
        <div className="overflow-x-auto rounded-lg border bg-white shadow dark:bg-gray-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="sticky left-0 w-40 bg-gray-100 text-center font-bold dark:bg-gray-800">NO. OF DAYS</TableHead>
                        {stages.map((stage) => (
                            <TableHead key={stage} className="min-w-[120px] text-center font-bold">
                                {getStageLabel(stage).toUpperCase()}
                            </TableHead>
                        ))}
                        <TableHead className="bg-gray-200 text-center font-bold dark:bg-gray-700">TOTAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ageingData.map((row) => {
                        const isTotalRow = row.range_index === -1;
                        const rangeLabel = formatAgeRangeLabel(row.min_days, row.max_days);

                        const actualRangeIndex = isTotalRow ? -1 : row.range_index + rangeOffset;

                        return (
                            <TableRow key={row.range_index} className={isTotalRow ? 'font-bold' : ''}>
                                <TableCell
                                    className={cn(
                                        'sticky left-0 w-40 text-center font-semibold',
                                        isTotalRow ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50',
                                    )}
                                >
                                    {rangeLabel}
                                </TableCell>
                                {stages.map((stage) => {
                                    const count = row.stages[stage] || 0;
                                    return (
                                        <TableCell
                                            key={stage}
                                            className={cn(
                                                'text-center',
                                                getCellColor(count, isTotalRow),
                                                count > 0 && !isTotalRow && 'cursor-pointer transition-all hover:ring-2 hover:ring-inset',
                                                count > 0 && !isTotalRow && getHoverRingColor(count),
                                            )}
                                            onClick={() => !isTotalRow && onCellClick(stage, actualRangeIndex, count, row.min_days, row.max_days)}
                                            role={count > 0 && !isTotalRow ? 'button' : undefined}
                                            tabIndex={count > 0 && !isTotalRow ? 0 : undefined}
                                            aria-label={
                                                count > 0 && !isTotalRow
                                                    ? `View ${count} applications in ${getStageLabel(stage)} stage for ${rangeLabel}`
                                                    : undefined
                                            }
                                        >
                                            <span
                                                className={cn('font-semibold', isTotalRow ? 'text-gray-900 dark:text-gray-100' : getTextColor(count))}
                                            >
                                                {count}
                                            </span>
                                        </TableCell>
                                    );
                                })}
                                <TableCell
                                    className={cn(
                                        'text-center font-bold',
                                        'bg-gray-100 dark:bg-gray-800',
                                        isTotalRow && 'bg-gray-200 dark:bg-gray-700',
                                    )}
                                >
                                    {row.total}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

export default function AgeingTimelineIndex() {
    const { ageingDataBelow30, ageingData30AndAbove, grandTotalBelow30, grandTotal30AndAbove, stages } = usePage<AgeingTimelinePageProps>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ stage: string; stageLabel: string; rangeLabel: string } | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCellClick = async (stage: string, rangeIndex: number, count: number, minDays: number | null, maxDays: number | null) => {
        if (count === 0 || rangeIndex === -1) return;

        const rangeLabel = formatAgeRangeLabel(minDays, maxDays);
        const stageLabel = getStageLabel(stage);

        setSelectedCell({ stage, stageLabel, rangeLabel });
        setDialogOpen(true);
        setLoading(true);

        try {
            setError(null);
            const response = await fetch(
                route('ageing-timeline.applications', {
                    stage,
                    age_range_index: rangeIndex,
                }),
            );

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to load applications');
            }

            setApplications(data.applications || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            console.error('Failed to fetch applications:', err);
            setError(errorMessage);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Reports', href: '#' },
                { title: 'Aging Timeline', href: route('ageing-timeline.index') },
            ]}
        >
            <Head title="Aging Timeline Report" />

            <div className="space-y-6 p-4 lg:p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Aging Timeline Report</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Track aging of applications across different processing stages. Click on cells to view details.
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="below-30" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="below-30" className="text-sm">
                            Applications Below 30 Days ({grandTotalBelow30})
                        </TabsTrigger>
                        <TabsTrigger value="30-and-above" className="text-sm">
                            Applications 30 Days and Above ({grandTotal30AndAbove})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="below-30">
                        <AgeingTable ageingData={ageingDataBelow30} stages={stages} onCellClick={handleCellClick} rangeOffset={0} />
                    </TabsContent>

                    <TabsContent value="30-and-above">
                        <AgeingTable
                            ageingData={ageingData30AndAbove}
                            stages={stages}
                            onCellClick={handleCellClick}
                            rangeOffset={ageingDataBelow30.length - 1}
                        />
                    </TabsContent>
                </Tabs>

                {/* Legend */}
                <div className="rounded-lg border bg-white p-4 shadow dark:bg-gray-900">
                    <h3 className="mb-3 text-sm font-semibold">Color Legend</h3>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-green-50 dark:bg-green-900/20"></div>
                            <span>1-5 applications (Low)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-yellow-50 dark:bg-yellow-900/20"></div>
                            <span>6-15 applications (Moderate)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-red-50 dark:bg-red-900/20"></div>
                            <span>&gt; 15 applications (High)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[85vh] sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCell?.stageLabel} - {selectedCell?.rangeLabel}
                        </DialogTitle>
                        {selectedCell && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Applications that have been in this stage for {selectedCell.rangeLabel.toLowerCase()}
                            </p>
                        )}
                    </DialogHeader>

                    <div className="mt-4 max-h-[calc(85vh-120px)] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-8 text-center">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                                <button
                                    onClick={() => handleCellClick(selectedCell!.stage, -1, 1, null, null)}
                                    className="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : applications.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">No applications found</p>
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account Number</TableHead>
                                            <TableHead>Customer Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Cause of Delay</TableHead>
                                            <TableHead className="text-center">Days in Stage</TableHead>
                                            <TableHead className="text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-medium">{app.account_number}</TableCell>
                                                <TableCell>{app.customer_name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                        {app.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {app.cause_of_delay ? (
                                                        <div className="space-y-1">
                                                            <div className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                                {app.cause_of_delay.delay_source}
                                                            </div>
                                                            {app.cause_of_delay.remarks && (
                                                                <p className="text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                                                                    {app.cause_of_delay.remarks}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">No delay logged</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center whitespace-nowrap">
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            {Math.floor(app.days_elapsed)} {Math.floor(app.days_elapsed) === 1 ? 'day' : 'days'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            ({app.days_elapsed_human})
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <a
                                                        href={route('applications.show', app.id) + '?tab=logs'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        View
                                                    </a>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
