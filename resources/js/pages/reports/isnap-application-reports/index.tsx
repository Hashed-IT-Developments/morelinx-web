import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { Badge } from '@/components/ui/badge';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApplicationReportFilters } from '@/components/application-report/filters';
import { useApplicationReportFilters } from '@/hooks/use-application-report-filters';
import type { ApplicationReportPageProps } from '@/types/application-report-types';

export default function ApplicationReportIndex() {
    const { applications, allApplications, pagination, towns, filters } = usePage<ApplicationReportPageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const {
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedStatus,
        setSelectedStatus,
        selectedTownId,
        setSelectedTownId,
        selectedRateClass,
        setSelectedRateClass,
        handleFilter,
    } = useApplicationReportFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialStatus: filters.status || 'all',
        initialTownId: filters.town_id ? String(filters.town_id) : 'all',
        initialRateClass: filters.rate_class || 'all',
        routeName: 'isnap-application-reports.index',
    });

    const [sortField, setSortField] = useState<string>(filters.sort_field || 'date_applied');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'desc');

    const handleDownload = () => {
        if (!allApplications || allApplications.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `isnap_application_report_${fromDate}_to_${toDate}`;
        downloadExcel(allApplications, filename);
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
        if (selectedTownId && selectedTownId !== 'all') {
            filterData.town_id = selectedTownId;
        }
        if (selectedRateClass && selectedRateClass !== 'all') {
            filterData.rate_class = selectedRateClass;
        }

        router.post(route('isnap-application-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const handleRowClick = (row: Record<string, unknown>) => {
        setSelectedApplicationId(row.id as string | number);
        setSummaryDialogOpen(true);
    };

    // Define columns for PaginatedTable
    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            header: 'ID',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'account_number',
            header: 'Account Number',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'customer_name',
            header: 'Customer Name',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'rate_class',
            header: 'Rate Class',
            className: 'text-left capitalize',
            hiddenOnMobile: true,
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            className: 'text-left',
            hiddenOnMobile: true,
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
            hiddenOnMobile: true,
            sortable: true,
        },
        {
            key: 'barangay',
            header: 'Barangay',
            className: 'text-left',
            hiddenOnTablet: true,
            sortable: true,
        },
        {
            key: 'load',
            header: 'Load (kW)',
            className: 'text-right',
            hiddenOnTablet: true,
            sortable: true,
        },
        {
            key: 'date_applied',
            header: 'Date Applied',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'date_installed',
            header: 'Date Installed',
            className: 'text-left',
            hiddenOnMobile: true,
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

        // Previous link
        links.push({
            url: pagination.current_page > 1 ? `?page=${pagination.current_page - 1}` : undefined,
            label: '&laquo; Previous',
            active: false,
        });

        // Page number links
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

        // Next link
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
            if (selectedTownId && selectedTownId !== 'all') {
                filterData.town_id = selectedTownId;
            }
            if (selectedRateClass && selectedRateClass !== 'all') {
                filterData.rate_class = selectedRateClass;
            }

            router.post(route('isnap-application-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'ISNAP Application Report', href: route('isnap-application-reports.index') },
            ]}
        >
            <Head title="ISNAP Application Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">ISNAP Application Report</h1>

                    <ApplicationReportFilters
                        fromDate={fromDate}
                        toDate={toDate}
                        status={selectedStatus}
                        townId={selectedTownId}
                        rateClass={selectedRateClass}
                        towns={towns}
                        onFromDateChange={setFromDate}
                        onToDateChange={setToDate}
                        onStatusChange={setSelectedStatus}
                        onTownChange={setSelectedTownId}
                        onRateClassChange={setSelectedRateClass}
                        onFilter={handleFilter}
                        onDownload={handleDownload}
                    />
                </div>

                <PaginatedTable
                    data={paginationData}
                    columns={columns}
                    onSort={handleSort}
                    currentSort={{ field: sortField, direction: sortDirection }}
                    rowClassName={() => 'cursor-pointer hover:bg-muted/50'}
                    onRowClick={handleRowClick}
                    emptyMessage="No ISNAP application records found."
                    onPageChange={handlePageChange}
                    mobileCardRender={(row) => (
                        <div className="space-y-3 p-4" onClick={() => handleRowClick(row)}>
                            <div className="border-b border-gray-100 pb-2 dark:border-gray-700">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        ID / Account Number
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.id as string} / {row.account_number as string}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Customer Name
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.customer_name as string}</div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Date Applied
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.date_applied as string}</div>
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
