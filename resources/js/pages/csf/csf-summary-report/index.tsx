import { CsfSummaryFilters } from '@/components/csf-summary/filters';
import { Badge } from '@/components/ui/badge';
import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import { useCsfSummaryReportFilters } from '@/hooks/use-csf-summary-report-filters';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { useStatusUtils } from '@/lib/status-utils';
import type { CsfSummaryReportPageProps, CsfTicket } from '@/types/csf-summary-report-types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CsfSummaryReportIndex() {
    const { tickets, allTickets, pagination, ticket_types, concern_types, users, filters } = usePage<CsfSummaryReportPageProps>().props;
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const {
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedTicketTypeId,
        setSelectedTicketTypeId,
        selectedConcernTypeId,
        setSelectedConcernTypeId,
        selectedStatus,
        setSelectedStatus,
        selectedUserId,
        setSelectedUserId,
        handleFilter,
    } = useCsfSummaryReportFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialTicketTypeId: filters.ticket_type_id ? String(filters.ticket_type_id) : 'all',
        initialConcernTypeId: filters.concern_type_id ? String(filters.concern_type_id) : 'all',
        initialStatus: filters.status || 'all',
        initialUserId: filters.user_id ? String(filters.user_id) : 'all',
        routeName: 'csf-summary-reports.index',
    });

    const [sortField, setSortField] = useState<string>(filters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'desc');

    const handleDownload = () => {
        if (!allTickets || allTickets.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `csf_summary_report_${fromDate}_to_${toDate}`;
        downloadExcel(allTickets, filename);
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

        if (selectedTicketTypeId && selectedTicketTypeId !== 'all') {
            filterData.ticket_type_id = selectedTicketTypeId;
        }
        if (selectedConcernTypeId && selectedConcernTypeId !== 'all') {
            filterData.concern_type_id = selectedConcernTypeId;
        }
        if (selectedStatus && selectedStatus !== 'all') {
            filterData.status = selectedStatus;
        }
        if (selectedUserId && selectedUserId !== 'all') {
            filterData.user_id = selectedUserId;
        }

        router.post(route('csf-summary-reports.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRowClick = (row: Record<string, unknown>) => {
        // Open ticket view
        const ticket = row as unknown as CsfTicket;
        const id = ticket.id;
        if (id) {
            router.visit('/tickets/view?ticket_id=' + id);
        }
    };

    const columns: ColumnDefinition[] = [
        { key: 'ticket_no', header: 'Ticket #', className: 'text-left', sortable: true },
        { key: 'account_number', header: 'Account #', className: 'text-left', sortable: true },
        { key: 'customer_name', header: 'Customer Name', className: 'text-left', sortable: true },
        { key: 'ticket_type', header: 'Ticket Type', className: 'text-left capitalize', sortable: true },
        { key: 'concern_type', header: 'Concern Type', className: 'text-left', sortable: true },
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
        { key: 'town', header: 'Town', className: 'text-left', sortable: true },
        { key: 'barangay', header: 'Barangay', className: 'text-left', sortable: true },
        { key: '-', header: 'Ticket Created', className: 'text-left', sortable: true },
        { key: 'user', header: 'User', className: 'text-left', sortable: true },
        { key: 'created_at', header: 'Date Logged', className: 'text-left', sortable: true },
    ];

    const paginationData: PaginationData = {
        data: tickets.map((t) => t as unknown as Record<string, unknown>),
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
                links.push({ url: `?page=${i}`, label: String(i), active: i === pagination.current_page });
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

    const handlePageNav = (url: string) => {
        const page = new URL(url, window.location.origin).searchParams.get('page');
        if (page) {
            const filterData: Record<string, string> = {
                from_date: fromDate,
                to_date: toDate,
                page: page,
                sort_field: sortField,
                sort_direction: sortDirection,
            };

            if (selectedTicketTypeId && selectedTicketTypeId !== 'all') {
                filterData.ticket_type_id = selectedTicketTypeId;
            }
            if (selectedConcernTypeId && selectedConcernTypeId !== 'all') {
                filterData.concern_type_id = selectedConcernTypeId;
            }
            if (selectedStatus && selectedStatus !== 'all') {
                filterData.status = selectedStatus;
            }
            if (selectedUserId && selectedUserId !== 'all') {
                filterData.user_id = selectedUserId;
            }

            router.post(route('csf-summary-reports.index'), filterData, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'CSF Summary Report', href: route('csf-summary-reports.index') },
            ]}
        >
            <Head title="CSF Summary Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <CsfSummaryFilters
                    fromDate={fromDate}
                    toDate={toDate}
                    ticketTypeId={selectedTicketTypeId}
                    concernTypeId={selectedConcernTypeId}
                    status={selectedStatus}
                    userId={selectedUserId}
                    ticketTypes={ticket_types}
                    concernTypes={concern_types}
                    users={users}
                    onFromDateChange={setFromDate}
                    onToDateChange={setToDate}
                    onTicketTypeChange={setSelectedTicketTypeId}
                    onConcernTypeChange={setSelectedConcernTypeId}
                    onStatusChange={setSelectedStatus}
                    onUserChange={setSelectedUserId}
                    onFilter={handleFilter}
                    onDownload={handleDownload}
                />

                <PaginatedTable
                    data={paginationData}
                    columns={columns}
                    onSort={handleSort}
                    currentSort={{ field: sortField, direction: sortDirection }}
                    rowClassName={() => 'cursor-pointer hover:bg-muted/50'}
                    onRowClick={handleRowClick}
                    emptyMessage="No CSF records found."
                    onPageChange={handlePageNav}
                />
            </div>
        </AppLayout>
    );
}
