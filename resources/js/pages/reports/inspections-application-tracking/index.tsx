import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { DatePicker } from '@/components/daily-monitoring/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import { Inspection as MonitoringInspection } from '@/types/monitoring-types';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Inspector {
    id: number;
    name: string;
}

interface Application {
    id: number;
    inspection_id: number;
    account_number: string;
    customer: string;
    customer_name: string;
    status: string;
    customer_type: string;
    address: string;
    town: string;
    barangay: string;
    schedule_date: string;
    inspector: string;
    customer_application?: {
        id: number;
    } | null;
}

interface PageProps {
    [key: string]: unknown;
    applications: Application[];
    allApplications: Application[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    inspectors: Inspector[];
    filters: {
        from_date: string;
        to_date: string;
        inspector_id: number | null;
        sort_field: string;
        sort_direction: 'asc' | 'desc';
    };
}

export default function InspectionsApplicationTrackingReportIndex() {
    const { applications, allApplications, pagination, inspectors, filters } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [fromDate, setFromDate] = useState(filters.from_date);
    const [toDate, setToDate] = useState(filters.to_date);
    const [selectedInspectorId, setSelectedInspectorId] = useState<string>(filters.inspector_id ? String(filters.inspector_id) : '');
    const [sortField, setSortField] = useState<string>(filters.sort_field || 'schedule_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.sort_direction || 'asc');

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const [hasFiltered, setHasFiltered] = useState(!!filters.inspector_id);

    const handleFilter = () => {
        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        if (selectedInspectorId) {
            filterData.inspector_id = selectedInspectorId;
            setHasFiltered(true);
        }

        router.post(route('inspections-application-tracking-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        if (!allApplications || allApplications.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const inspectorName = inspectors.find((i) => i.id === Number(selectedInspectorId))?.name || 'all_inspectors';
        const filename = `inspections_application_tracking_${inspectorName}_${fromDate}_to_${toDate}`;
        downloadExcel(allApplications as unknown as MonitoringInspection[], filename);
        toast.success('Download started successfully');
    };

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);

        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
            sort_field: field,
            sort_direction: direction,
        };

        if (selectedInspectorId) {
            filterData.inspector_id = selectedInspectorId;
        }

        router.post(route('inspections-application-tracking-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewSummary = (application: Application) => {
        setSelectedApplicationId(application.customer_application?.id || application.id);
        setSummaryDialogOpen(true);
    };

    const handleRowClick = (row: Record<string, unknown>) => {
        const application = row as unknown as Application;
        const applicationId = application.customer_application?.id || application.id;
        if (applicationId) {
            router.visit(`/applications/${applicationId}`);
        }
    };

    // Define columns for PaginatedTable
    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account Number',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'customer',
            header: 'Customer Name',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'customer_type',
            header: 'Customer Type',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            className: 'text-left',
            render: (value) => (
                <Badge variant="outline" className={`${getStatusColor(value as string)} text-xs font-medium`}>
                    {getStatusLabel(value as string)}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'town',
            header: 'Town',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'barangay',
            header: 'Barangay',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'schedule_date',
            header: 'Schedule Date',
            className: 'text-left',
            sortable: true,
        },
    ];

    // Transform data for PaginatedTable
    const paginationData: PaginationData = {
        data: applications.map((app) => app as unknown as Record<string, unknown>),
        current_page: pagination.current_page,
        from: (pagination.current_page - 1) * pagination.per_page + 1,
        last_page: pagination.last_page,
        per_page: pagination.per_page,
        to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
        total: pagination.total,
        links: [],
    };

    // Generate pagination links
    const generateLinks = () => {
        const links: Array<{ url?: string; label: string; active: boolean }> = [];

        links.push({
            url: pagination.current_page > 1 ? `?page=${pagination.current_page - 1}` : undefined,
            label: '&laquo; Previous',
            active: false,
        });

        for (let i = 1; i <= pagination.last_page; i++) {
            if (i === 1 || i === pagination.last_page || (i >= pagination.current_page - 2 && i <= pagination.current_page + 2)) {
                links.push({
                    url: `?page=${i}`,
                    label: String(i),
                    active: i === pagination.current_page,
                });
            } else if (i === pagination.current_page - 3 || i === pagination.current_page + 3) {
                links.push({
                    label: '...',
                    active: false,
                });
            }
        }

        links.push({
            url: pagination.current_page < pagination.last_page ? `?page=${pagination.current_page + 1}` : undefined,
            label: 'Next &raquo;',
            active: false,
        });

        return links;
    };

    paginationData.links = generateLinks();

    const handlePageChange = (url: string) => {
        const page = new URL(url, window.location.origin).searchParams.get('page');
        if (page) {
            const filterData: Record<string, string> = {
                from_date: fromDate,
                to_date: toDate,
                page: page,
                sort_field: sortField,
                sort_direction: sortDirection,
            };

            if (selectedInspectorId) {
                filterData.inspector_id = selectedInspectorId;
            }

            router.post(route('inspections-application-tracking-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Inspections Application Tracking', href: route('inspections-application-tracking-reports.index') },
            ]}
        >
            <Head title="Inspections Application Tracking Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">Inspections Application Tracking Report</h1>

                    <div className="flex flex-wrap items-end gap-2">
                        <DatePicker id="from-date" label="From" value={fromDate} onChange={setFromDate} />
                        <DatePicker id="to-date" label="To" value={toDate} onChange={setToDate} />

                        <div className="space-y-1">
                            <Label htmlFor="inspector" className="text-xs">
                                Inspector
                            </Label>
                            <Select value={selectedInspectorId || undefined} onValueChange={setSelectedInspectorId}>
                                <SelectTrigger id="inspector" className="h-9 w-[200px] text-xs">
                                    <SelectValue placeholder="Select Inspector" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inspectors.map((inspector) => (
                                        <SelectItem key={inspector.id} value={String(inspector.id)}>
                                            {inspector.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button size="sm" onClick={handleFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                            Filter
                        </Button>

                        <Button size="sm" variant="outline" onClick={handleDownload} className="h-9 px-4 text-xs" disabled={!selectedInspectorId}>
                            Download
                        </Button>
                    </div>
                </div>

                <PaginatedTable
                    data={paginationData}
                    columns={columns}
                    onSort={handleSort}
                    currentSort={{ field: sortField, direction: sortDirection }}
                    rowClassName={() => 'cursor-pointer hover:bg-muted/50'}
                    onRowClick={handleRowClick}
                    emptyMessage={
                        hasFiltered && selectedInspectorId
                            ? 'No applications found for the selected inspector'
                            : 'Please select an inspector and click Filter to view applications'
                    }
                    onPageChange={handlePageChange}
                    actions={(row) => {
                        const application = row as unknown as Application;
                        return (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSummary(application);
                                }}
                            >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                            </Button>
                        );
                    }}
                    mobileCardRender={(row) => (
                        <div className="space-y-3 p-4" onClick={() => handleRowClick(row)}>
                            <div className="border-b border-gray-100 pb-2 dark:border-gray-700">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Account Number
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.account_number as string}</div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Customer Name
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.customer as string}</div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Schedule Date
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.schedule_date as string}</div>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>

            <ApplicationSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
