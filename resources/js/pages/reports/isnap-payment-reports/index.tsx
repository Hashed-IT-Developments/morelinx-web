import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import { TablePagination } from '@/components/daily-monitoring/table-pagination';
import { IsnapPaymentFilters } from '@/components/isnap-payment-report/filters';
import { IsnapPaymentTable } from '@/components/isnap-payment-report/isnap-payment-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsnapPaymentFilters } from '@/hooks/use-isnap-payment-filters';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import type { IsnapPayment, IsnapPaymentPageProps } from '@/types/isnap-payment-types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function IsnapPaymentReportIndex() {
    const { payments, allPayments, pagination, towns, filters } = usePage<IsnapPaymentPageProps>().props;

    const { fromDate, setFromDate, toDate, setToDate, selectedTownId, setSelectedTownId, handleFilter, handlePageChange } = useIsnapPaymentFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialTownId: filters.town_id ? String(filters.town_id) : 'all',
    });

    const handleDownload = () => {
        if (!allPayments || allPayments.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `isnap_payment_report_${fromDate}_to_${toDate}`;
        downloadExcel(allPayments, filename);
        toast.success('Download started successfully');
    };

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const handleRowClick = (payment: IsnapPayment) => {
        setSelectedApplicationId(payment.id);
        setSummaryDialogOpen(true);
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
                <Card className="flex flex-col">
                    <CardHeader className="space-y-3 pb-3">
                        <CardTitle className="text-base font-semibold">ISNAP Payment Report</CardTitle>

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
                    </CardHeader>

                    <CardContent className="flex-1 p-0">
                        <IsnapPaymentTable payments={payments} onRowClick={handleRowClick} />
                        <TablePagination pagination={pagination} onPageChange={handlePageChange} />
                    </CardContent>
                </Card>
            </div>

            <ApplicationSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
