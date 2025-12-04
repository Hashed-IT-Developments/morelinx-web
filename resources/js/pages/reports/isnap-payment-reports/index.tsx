import ComprehensiveSummaryDialog from '@/components/comprehensive-summary-dialog';
import { IsnapPaymentFilters } from '@/components/isnap-payment-report/filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import { useIsnapPaymentFilters } from '@/hooks/use-isnap-payment-filters';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import type { IsnapPaymentPageProps } from '@/types/isnap-payment-types';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function IsnapPaymentReportIndex() {
    const { payments, allPayments, pagination, towns, filters } = usePage<IsnapPaymentPageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const { fromDate, setFromDate, toDate, setToDate, selectedTownId, setSelectedTownId, handleFilter } = useIsnapPaymentFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialTownId: filters.town_id ? String(filters.town_id) : 'all',
    });

    const [sortField, setSortField] = useState<string>(filters.sort_field || 'date_paid');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'desc');

    const handleDownload = () => {
        if (!allPayments || allPayments.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `isnap_payment_report_${fromDate}_to_${toDate}`;
        downloadExcel(allPayments, filename);
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

        if (selectedTownId && selectedTownId !== 'all') {
            filterData.town_id = selectedTownId;
        }

        router.post(route('isnap-payment-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const handleViewSummary = (application: CustomerApplication) => {
        setSelectedApplicationId(application.id);
        setSummaryDialogOpen(true);
    };

    const handleRowClick = (row: Record<string, unknown>) => {
        const application = row as unknown as CustomerApplication;
        if (application?.id) {
            router.visit(`/applications/${application.id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
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
            key: 'customer_name',
            header: 'Customer Name',
            className: 'text-left',
            sortable: true,
        },
        {
            key: 'rate_class',
            header: 'Rate Class',
            className: 'text-left capitalize',
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
            key: 'paid_amount',
            header: 'Paid Amount',
            className: 'text-right font-medium',
            render: (value) => formatCurrency(value as number),
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
            sortable: true,
        },
    ];

    // Transform data for PaginatedTable
    const paginationData: PaginationData = {
        data: payments.map((payment) => payment as unknown as Record<string, unknown>),
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
            };

            if (selectedTownId && selectedTownId !== 'all') {
                filterData.town_id = selectedTownId;
            }

            router.post(route('isnap-payment-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'ISNAP Payment Report', href: route('isnap-payment-reports.index') },
            ]}
        >
            <Head title="ISNAP Payment Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold">ISNAP Payment Report</h1>

                    <IsnapPaymentFilters
                        fromDate={fromDate}
                        toDate={toDate}
                        townId={selectedTownId}
                        towns={towns}
                        onFromDateChange={setFromDate}
                        onToDateChange={setToDate}
                        onTownChange={setSelectedTownId}
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
                    emptyMessage="No ISNAP payment records found."
                    onPageChange={handlePageChange}
                    actions={(row) => {
                        const application = row as unknown as CustomerApplication;
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
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.customer_name && row.customer_name !== 'N/A' ? String(row.customer_name) : String(row.identity)}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Paid Amount
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatCurrency(row.paid_amount as number)}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Date Installed
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.date_installed as string}</div>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>

            <ComprehensiveSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
