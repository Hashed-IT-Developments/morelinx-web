import ComprehensiveSummaryDialog from '@/components/comprehensive-summary-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/hooks/use-filters';
import AppLayout from '@/layouts/app-layout';
import { downloadExcel } from '@/lib/export-utils';
import type { Inspection, PageProps } from '@/types/monitoring-types';
import { router, usePage } from '@inertiajs/react';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApplicationsFilters, InspectionsFilters } from './components/filters';
import InspectionDetailsModal from './components/inspection-details-modal';
import { InspectionsTable } from './components/inspections-table';
import { TablePagination } from './components/table-pagination';

export default function DailyMonitoringIndex() {
    const {
        customerInspections,
        allCustomerInspections,
        customerInspectionsPagination,
        inspectorApplications,
        allInspectorApplications,
        inspectorApplicationsPagination,
        inspectors,
        filters,
    } = usePage<PageProps>().props;

    const {
        inspectionsFromDate,
        setInspectionsFromDate,
        inspectionsToDate,
        setInspectionsToDate,
        applicationsFromDate,
        setApplicationsFromDate,
        applicationsToDate,
        setApplicationsToDate,
        selectedInspectionsStatus,
        setSelectedInspectionsStatus,
        selectedInspectorId,
        setSelectedInspectorId,
        handleInspectionsFilter,
        handleApplicationsFilter,
        handleInspectionsPageChange,
        handleApplicationsPageChange,
    } = useFilters({
        initialInspectionsFromDate: filters.inspections_from_date || filters.from_date,
        initialInspectionsToDate: filters.inspections_to_date || filters.to_date,
        initialApplicationsFromDate: filters.applications_from_date || filters.from_date,
        initialApplicationsToDate: filters.applications_to_date || filters.to_date,
        initialInspectionsStatus: filters.inspections_status || 'all',
        initialInspectorId: filters.inspector_id ? String(filters.inspector_id) : 'all',
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<typeof allCustomerInspections>([]);
    const [modalTitle, setModalTitle] = useState('');

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);

    const handleDownloadInspections = () => {
        if (!allCustomerInspections || allCustomerInspections.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const filename = `customer_inspections_${inspectionsFromDate}_to_${inspectionsToDate}`;
        downloadExcel(allCustomerInspections, filename);
        toast.success('Download started successfully');
    };

    const handleDownloadApplications = () => {
        if (!allInspectorApplications || allInspectorApplications.length === 0) {
            toast.error('No data available to download');
            return;
        }
        const inspectorName = inspectors.find((i) => i.id === Number(selectedInspectorId))?.name || 'all_inspectors';
        const filename = `inspector_applications_${inspectorName}_${applicationsFromDate}_to_${applicationsToDate}`;
        downloadExcel(allInspectorApplications, filename);
        toast.success('Download started successfully');
    };

    const handleViewSummary = (inspection: Inspection) => {
        setSelectedApplicationId(inspection.customer_application?.id || inspection.id);
        setSummaryDialogOpen(true);
    };

    const handleRowClick = (inspection: Inspection) => {
        const applicationId = inspection.customer_application?.id || inspection.id;
        if (applicationId) {
            router.visit(`/applications/${applicationId}`);
        }
    };

    const handleMaximizeLeft = () => {
        setModalData(allCustomerInspections);
        setModalTitle('Customer Inspections - Detailed View');
        setModalOpen(true);
    };

    const handleMaximizeRight = () => {
        setModalData(allInspectorApplications);
        const inspectorName = inspectors.find((i) => i.id === Number(selectedInspectorId))?.name;
        setModalTitle(selectedInspectorId !== 'all' ? `Inspector Applications - ${inspectorName}` : 'All Inspector Applications - Detailed View');
        setModalOpen(true);
    };

    return (
        <AppLayout
            title="Daily Monitoring"
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Daily Monitoring', href: route('inspections-daily-monitoring.index') },
            ]}
        >
            <div className="space-y-4 p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader className="space-y-3 pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base font-semibold">Inspections Daily Monitor</CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2" onClick={handleMaximizeLeft}>
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <InspectionsFilters
                                fromDate={inspectionsFromDate}
                                toDate={inspectionsToDate}
                                status={selectedInspectionsStatus}
                                onFromDateChange={setInspectionsFromDate}
                                onToDateChange={setInspectionsToDate}
                                onStatusChange={setSelectedInspectionsStatus}
                                onFilter={handleInspectionsFilter}
                                onDownload={handleDownloadInspections}
                            />
                        </CardHeader>

                        <CardContent className="flex-1 overflow-auto p-0">
                            <InspectionsTable inspections={customerInspections} onRowClick={handleRowClick} onView={handleViewSummary} />
                            <TablePagination pagination={customerInspectionsPagination} onPageChange={handleInspectionsPageChange} />
                        </CardContent>
                    </Card>

                    {/* Inspector Applications Tracking */}
                    <Card className="flex flex-col">
                        <CardHeader className="space-y-3 pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base font-semibold">Inspector Applications Tracking</CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2" onClick={handleMaximizeRight}>
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <ApplicationsFilters
                                fromDate={applicationsFromDate}
                                toDate={applicationsToDate}
                                inspectorId={selectedInspectorId}
                                inspectors={inspectors}
                                onFromDateChange={setApplicationsFromDate}
                                onToDateChange={setApplicationsToDate}
                                onInspectorChange={setSelectedInspectorId}
                                onFilter={handleApplicationsFilter}
                                onDownload={handleDownloadApplications}
                            />
                        </CardHeader>

                        <CardContent className="flex-1 overflow-auto p-0">
                            <InspectionsTable
                                inspections={inspectorApplications}
                                onRowClick={handleRowClick}
                                onView={handleViewSummary}
                                emptyMessage={
                                    selectedInspectorId && selectedInspectorId !== 'all'
                                        ? 'No applications found for the selected inspector'
                                        : 'Please select an inspector to view applications'
                                }
                            />
                            {inspectorApplicationsPagination && (
                                <TablePagination pagination={inspectorApplicationsPagination} onPageChange={handleApplicationsPageChange} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <InspectionDetailsModal open={modalOpen} onOpenChange={setModalOpen} inspections={modalData} title={modalTitle} />
            <ComprehensiveSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
