import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { ApplicationReportFilters } from '../../../components/application-report/filters';
import { ApplicationReportTable } from '../../../components/application-report/table';
import { TablePagination } from '../../../components/daily-monitoring/table-pagination';
import { useApplicationReportFilters } from '../../../hooks/use-application-report-filters';
import type { ApplicationReportPageProps } from '../../../types/application-report-types';

export default function ApplicationReportIndex() {
    const { applications, pagination, towns, filters } = usePage<ApplicationReportPageProps>().props;

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
        handlePageChange,
    } = useApplicationReportFilters({
        initialFromDate: filters.from_date,
        initialToDate: filters.to_date,
        initialStatus: filters.status || 'all',
        initialTownId: filters.town_id ? String(filters.town_id) : 'all',
        initialRateClass: filters.rate_class || 'all',
    });

    const handleDownload = () => {
        if (!applications || applications.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `application_report_${fromDate}_to_${toDate}`;
        downloadExcel(applications, filename);
        toast.success('Download started successfully');
    };

    // TODO: Uncomment when ApplicationSummaryDialog is ready
    // const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    // const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    // const handleRowClick = (application: Application) => {
    //     setSelectedApplicationId(application.id);
    //     setSummaryDialogOpen(true);
    // };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Application Report', href: route('application-reports.index') },
            ]}
        >
            <Head title="Application Report" />
            <div className="space-y-4 p-4 lg:p-6">
                <Card className="flex flex-col">
                    <CardHeader className="space-y-3 pb-3">
                        <CardTitle className="text-base font-semibold">Application Report</CardTitle>

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
                    </CardHeader>

                    <CardContent className="flex-1 p-0">
                        <ApplicationReportTable
                            applications={applications}
                            // TODO: Uncomment when ApplicationSummaryDialog is ready
                            // onRowClick={handleRowClick}
                        />
                        <TablePagination pagination={pagination} onPageChange={handlePageChange} />
                    </CardContent>
                </Card>
            </div>

            {/* TODO: Uncomment when ApplicationSummaryDialog is ready */}
            {/* <ApplicationSummaryDialog
                applicationId={selectedApplicationId}
                open={summaryDialogOpen}
                onOpenChange={setSummaryDialogOpen}
            /> */}
        </AppLayout>
    );
}
