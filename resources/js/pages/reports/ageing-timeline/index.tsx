import { PaginatedTable, type ColumnDefinition, type PaginationData } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

interface AgeingTimelineData {
    range: string;
    during_application: number;
    forwarded_to_inspector: number;
    inspection_date: number;
    inspection_uploaded_to_system: number;
    paid_to_cashier: number;
    contract_signed: number;
    assigned_to_lineman: number;
    downloaded_to_lineman: number;
    installed_date: number;
    activated: number;
    total: number;
}

interface AgeingTimelinePageProps extends PageProps {
    ageingData: AgeingTimelineData[];
    [key: string]: unknown;
}

export default function AgeingTimelineIndex() {
    const { ageingData } = usePage<AgeingTimelinePageProps>().props;

    // Define columns for the table
    const columns: ColumnDefinition[] = [
        {
            key: 'range',
            header: 'Number of Days Elapsed',
            className: 'text-left font-medium',
            headerClassName: 'text-left',
        },
        {
            key: 'during_application',
            header: 'During Application',
            className: 'text-center',
        },
        {
            key: 'forwarded_to_inspector',
            header: 'Forwarded To Inspector',
            className: 'text-center',
        },
        {
            key: 'inspection_date',
            header: 'Inspection Date',
            className: 'text-center',
        },
        {
            key: 'inspection_uploaded_to_system',
            header: 'Inspection Uploaded',
            className: 'text-center',
        },
        {
            key: 'paid_to_cashier',
            header: 'Paid To Cashier',
            className: 'text-center',
        },
        {
            key: 'contract_signed',
            header: 'Contract Signed',
            className: 'text-center',
        },
        {
            key: 'assigned_to_lineman',
            header: 'Assigned To Lineman',
            className: 'text-center',
        },
        {
            key: 'downloaded_to_lineman',
            header: 'Downloaded To Lineman',
            className: 'text-center',
        },
        {
            key: 'installed_date',
            header: 'Installed Date',
            className: 'text-center',
        },
        {
            key: 'activated',
            header: 'Activated',
            className: 'text-center',
        },
        {
            key: 'total',
            header: 'Total',
            className: 'text-center font-semibold',
            render: (value, row) => {
                const isLastRow = row.range === 'Total';
                return (
                    <span
                        className={`font-semibold ${isLastRow ? 'text-lg text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}
                    >
                        {value as number}
                    </span>
                );
            },
        },
    ];

    // Transform data for PaginatedTable (without actual pagination)
    const tableData: PaginationData = {
        data: ageingData.map((item) => item as unknown as Record<string, unknown>),
        current_page: 1,
        from: 1,
        last_page: 1,
        per_page: ageingData.length,
        to: ageingData.length,
        total: ageingData.length,
        links: [],
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Reports', href: '#' },
                { title: 'Ageing Timeline', href: route('ageing-timeline.index') },
            ]}
        >
            <Head title="Ageing Timeline Report" />

            <div className="space-y-4 p-4 lg:p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Ageing Timeline Report</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Number of applications per status by days elapsed</p>
                </div>

                <PaginatedTable
                    data={tableData}
                    columns={columns}
                    showPagination={false}
                    emptyMessage="No ageing timeline data available."
                    rowClassName={(row) => {
                        const isLastRow = row.range === 'Total';
                        return isLastRow ? 'bg-gray-50 dark:bg-gray-800 font-semibold' : '';
                    }}
                />
            </div>
        </AppLayout>
    );
}
