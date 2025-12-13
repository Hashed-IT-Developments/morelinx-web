import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import ApplicationSummaryDialog from '@/pages/crm/applications/components/application-summary-dialog';
import { Inspection as MonitoringInspection } from '@/types/monitoring-types';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Inspection {
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
    inspections: Inspection[];
    allInspections: Inspection[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        from_date: string;
        to_date: string;
        status: string;
        sort_field: string;
        sort_direction: 'asc' | 'desc';
    };
}

export default function InspectionsDailyMonitorReportIndex() {
    const { inspections, allInspections, pagination, filters } = usePage<PageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [fromDate, setFromDate] = useState(filters.from_date);
    const [toDate, setToDate] = useState(filters.to_date);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [sortField, setSortField] = useState<string>(filters.sort_field || 'schedule_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.sort_direction || 'asc');

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const handleFilter = () => {
        const filterData: Record<string, string> = {
            from_date: fromDate,
            to_date: toDate,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        if (selectedStatus && selectedStatus !== 'all') {
            filterData.status = selectedStatus;
        }

        router.post(route('inspections-daily-monitor-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        if (!allInspections || allInspections.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `inspections_daily_monitor_${fromDate}_to_${toDate}`;
        downloadExcel(allInspections as unknown as MonitoringInspection[], filename);
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

        if (selectedStatus && selectedStatus !== 'all') {
            filterData.status = selectedStatus;
        }

        router.post(route('inspections-daily-monitor-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewSummary = (inspection: Inspection) => {
        setSelectedApplicationId(inspection.customer_application?.id || inspection.id);
        setSummaryDialogOpen(true);
    };

    const handleRowClick = (row: Record<string, unknown>) => {
        const inspection = row as unknown as Inspection;
        const applicationId = inspection.customer_application?.id || inspection.id;
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
        {
            key: 'inspector',
            header: 'Inspector',
            className: 'text-left',
            sortable: true,
        },
    ];

    const paginationData: PaginationData = {
        data: inspections.map((insp) => insp as unknown as Record<string, unknown>),
        current_page: pagination.current_page,
        from: (pagination.current_page - 1) * pagination.per_page + 1,
        last_page: pagination.last_page,
        per_page: pagination.per_page,
        to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
        total: pagination.total,
        links: [],
    };

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

            if (selectedStatus && selectedStatus !== 'all') {
                filterData.status = selectedStatus;
            }

            router.post(route('inspections-daily-monitor-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Inspections Daily Monitor', href: route('inspections-daily-monitor-reports.index') },
            ]}
        >
            <Head title="Inspections Daily Monitor Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">Inspections Daily Monitor Report</h1>

                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            type="text"
                            id="from-date"
                            label="From"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value.toString());
                            }}
                        />
                        <Input
                            type="text"
                            id="to-date"
                            label="To"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value.toString());
                            }}
                        />

                        <div className="space-y-1">
                            <Label htmlFor="status" className="text-xs">
                                Status
                            </Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger id="status" className="h-9 w-40 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="for_inspection">For Inspection</SelectItem>
                                    <SelectItem value="for_inspection_approval">For Inspection Approval</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="disapproved">Disapproved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="reassigned">Reassigned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button size="sm" onClick={handleFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                            Filter
                        </Button>

                        <Button size="sm" variant="outline" onClick={handleDownload} className="h-9 px-4 text-xs">
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
                    emptyMessage="No inspection records found."
                    onPageChange={handlePageChange}
                    actions={(row) => {
                        const inspection = row as unknown as Inspection;
                        return (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSummary(inspection);
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
