import AccountReportFilters from '@/components/account-report/filters';
import ComprehensiveSummaryDialog from '@/components/comprehensive-summary-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import { useAccountReportFilters } from '@/hooks/use-account-report-filters';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import type { AccountReportPageProps, CustomerAccount } from '@/types/account-report-types';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AccountReportIndex() {
    const { accounts, allAccounts, pagination, towns, barangays, filters } = usePage<AccountReportPageProps>().props;
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
        selectedBarangayId,
        setSelectedBarangayId,
        barangays: availableBarangays,
        selectedRateClass,
        setSelectedRateClass,
        handleFilter,
    } = useAccountReportFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialStatus: filters.status || 'all',
        initialTownId: filters.town_id ? String(filters.town_id) : 'all',
        initialBarangayId: filters.barangay_id ? String(filters.barangay_id) : 'all',
        initialBarangays: barangays,
        initialRateClass: filters.rate_class || 'all',
        routeName: 'account-reports.index',
    });

    const [sortField, setSortField] = useState<string>(filters.sort_field || 'connection_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'desc');

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | number | null>(null);

    const handleDownload = () => {
        if (!allAccounts || allAccounts.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `account_report_${fromDate}_to_${toDate}`;
        downloadExcel(allAccounts, filename);
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

        if (selectedStatus && selectedStatus !== 'all') filterData.status = selectedStatus;
        if (selectedTownId && selectedTownId !== 'all') filterData.town_id = selectedTownId;
        if (selectedBarangayId && selectedBarangayId !== 'all') filterData.barangay_id = selectedBarangayId;
        if (selectedRateClass && selectedRateClass !== 'all') filterData.rate_class = selectedRateClass;

        router.post(route('account-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewSummary = (account: CustomerAccount) => {
        setSelectedAccountId(account.id);
        setSummaryDialogOpen(true);
    };

    const handleRowClick = (row: Record<string, unknown>) => {
        const account = row as unknown as CustomerAccount;
        if (account?.id) {
            router.visit(`/accounts/${account.id}`);
        }
    };

    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account Number',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'account_name',
            header: 'Account Name',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'customer_type',
            header: 'Customer Type',
            className: 'text-left capitalize',
            sortable: true,
        },
        {
            key: 'rate_class',
            header: 'Rate Class',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'account_status',
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
            key: 'connection_date',
            header: 'Connection Date',
            className: 'text-left',
            sortable: true,
        },
    ];

    const paginationData: PaginationData = {
        data: accounts.map((acc) => acc as unknown as Record<string, unknown>),
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
                links.push({ label: '...', active: false });
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

            if (selectedStatus && selectedStatus !== 'all') filterData.status = selectedStatus;
            if (selectedTownId && selectedTownId !== 'all') filterData.town_id = selectedTownId;
            if (selectedBarangayId && selectedBarangayId !== 'all') filterData.barangay_id = selectedBarangayId;
            if (selectedRateClass && selectedRateClass !== 'all') filterData.rate_class = selectedRateClass;

            router.post(route('account-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Account Report', href: route('account-reports.index') },
            ]}
        >
            <Head title="Account Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">Account Report</h1>

                    <AccountReportFilters
                        fromDate={fromDate}
                        toDate={toDate}
                        status={selectedStatus}
                        townId={selectedTownId}
                        barangayId={selectedBarangayId}
                        rateClass={selectedRateClass}
                        towns={towns}
                        barangays={availableBarangays}
                        onFromDateChange={setFromDate}
                        onToDateChange={setToDate}
                        onStatusChange={setSelectedStatus}
                        onTownChange={setSelectedTownId}
                        onBarangayChange={setSelectedBarangayId}
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
                        emptyMessage="No account records found."
                        onPageChange={handlePageChange}
                        actions={(row) => {
                            const account = row as unknown as CustomerAccount;
                            return (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewSummary(account);
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
                                            Account Name
                                        </span>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.account_name as string}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Customer Type
                                        </span>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.customer_type as string}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Connection Date
                                        </span>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.connection_date as string}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
            </div>

            <ComprehensiveSummaryDialog applicationId={null} accountId={selectedAccountId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
