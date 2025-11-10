import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { useStatusUtils } from '@/lib/status-utils';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarIcon, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import InspectionDetailsModal from './inspection-details-modal';

// --- Interfaces ---
interface Inspector {
    id: number;
    name: string;
}

interface CustomerApplication {
    id: number;
    account_number?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    birth_date?: string;
    nationality?: string;
    gender?: string;
    marital_status?: string;
    email_address?: string;
    mobile_1?: string;
    mobile_2?: string;
    tel_no_1?: string;
    tel_no_2?: string;
    barangay?: string;
    town?: string;
    district?: string;
    customer_type?: string;
    connected_load?: number;
    property_ownership?: string;
    is_sc?: boolean;
    is_isnap?: boolean;
    sitio?: string;
    unit_no?: string;
    building?: string;
    street?: string;
    subdivision?: string;
    landmark?: string;
    full_address?: string;
    sketch_lat_long?: string;
}

interface Inspection {
    id: number;
    inspection_id: number;
    customer: string;
    status: string;
    customer_type: string;
    address: string;
    schedule_date: string;
    inspector?: string;
    inspector_email?: string;
    customer_application?: CustomerApplication;
}

interface Filters {
    from_date: string;
    to_date: string;
    inspections_from_date: string;
    inspections_to_date: string;
    applications_from_date: string;
    applications_to_date: string;
    inspector_id?: number | null;
    inspections_status?: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    customerInspections: Inspection[];
    allCustomerInspections: Inspection[];
    customerInspectionsPagination: Pagination;
    inspectorApplications: Inspection[];
    allInspectorApplications: Inspection[];
    inspectorApplicationsPagination: Pagination | null;
    inspectors: Inspector[];
    filters: Filters;
    [key: string]: unknown;
}

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
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    // Inspections Daily Monitor filters (left table)
    const [inspectionsFromDate, setInspectionsFromDate] = useState(filters.inspections_from_date || filters.from_date);
    const [inspectionsToDate, setInspectionsToDate] = useState(filters.inspections_to_date || filters.to_date);
    const [selectedInspectionsStatus, setSelectedInspectionsStatus] = useState<string>(filters.inspections_status || 'all');

    // Inspector Applications Tracking filters (right table)
    const [applicationsFromDate, setApplicationsFromDate] = useState(filters.applications_from_date || filters.from_date);
    const [applicationsToDate, setApplicationsToDate] = useState(filters.applications_to_date || filters.to_date);
    const [selectedInspectorId, setSelectedInspectorId] = useState<string>(filters.inspector_id ? String(filters.inspector_id) : 'all');

    // Popover states
    const [openInspectionsFromDate, setOpenInspectionsFromDate] = useState(false);
    const [openInspectionsToDate, setOpenInspectionsToDate] = useState(false);
    const [openApplicationsFromDate, setOpenApplicationsFromDate] = useState(false);
    const [openApplicationsToDate, setOpenApplicationsToDate] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<Inspection[]>([]);
    const [modalTitle, setModalTitle] = useState('');

    const handleInspectionsFilter = () => {
        const params: Record<string, string> = {
            inspections_from_date: inspectionsFromDate,
            inspections_to_date: inspectionsToDate,
            applications_from_date: applicationsFromDate,
            applications_to_date: applicationsToDate,
            inspections_page: '1', // Reset to page 1 on filter
        };
        // Only add inspections status filter
        if (selectedInspectionsStatus !== 'all') {
            params.inspections_status = selectedInspectionsStatus;
        }
        // Preserve inspector filter if set
        if (selectedInspectorId !== 'all') {
            params.inspector_id = selectedInspectorId;
        }

        router.get(route('daily-monitoring.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplicationsFilter = () => {
        const params: Record<string, string> = {
            inspections_from_date: inspectionsFromDate,
            inspections_to_date: inspectionsToDate,
            applications_from_date: applicationsFromDate,
            applications_to_date: applicationsToDate,
            applications_page: '1', // Reset to page 1 on filter
        };
        // Only add inspector filter
        if (selectedInspectorId !== 'all') {
            params.inspector_id = selectedInspectorId;
        }
        // Preserve inspections status filter if set
        if (selectedInspectionsStatus !== 'all') {
            params.inspections_status = selectedInspectionsStatus;
        }

        router.get(route('daily-monitoring.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleInspectionsPageChange = (page: number) => {
        const params: Record<string, string> = {
            inspections_from_date: inspectionsFromDate,
            inspections_to_date: inspectionsToDate,
            applications_from_date: applicationsFromDate,
            applications_to_date: applicationsToDate,
            inspections_page: String(page),
        };
        if (selectedInspectionsStatus !== 'all') {
            params.inspections_status = selectedInspectionsStatus;
        }
        if (selectedInspectorId !== 'all') {
            params.inspector_id = selectedInspectorId;
        }

        router.get(route('daily-monitoring.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplicationsPageChange = (page: number) => {
        const params: Record<string, string> = {
            inspections_from_date: inspectionsFromDate,
            inspections_to_date: inspectionsToDate,
            applications_from_date: applicationsFromDate,
            applications_to_date: applicationsToDate,
            applications_page: String(page),
        };
        if (selectedInspectionsStatus !== 'all') {
            params.inspections_status = selectedInspectionsStatus;
        }
        if (selectedInspectorId !== 'all') {
            params.inspector_id = selectedInspectorId;
        }

        router.get(route('daily-monitoring.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        // TODO: Implement download functionality
        console.log('Download report');
    };

    const handleMaximizeLeft = () => {
        setModalData(allCustomerInspections);
        setModalTitle('Customer Inspections - Detailed View');
        setModalOpen(true);
    };

    const handleMaximizeRight = () => {
        setModalData(allInspectorApplications);
        const inspectorName = inspectors.find((i) => i.id === Number(selectedInspectorId))?.name;
        setModalTitle(selectedInspectorId ? `Inspector Applications - ${inspectorName}` : 'All Inspector Applications - Detailed View');
        setModalOpen(true);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Daily Monitoring', href: route('daily-monitoring.index') },
            ]}
        >
            <Head title="Daily Monitoring" />
            <div className="space-y-4 p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {/* Inspections Daily Monitor */}
                    <Card className="flex flex-col">
                        <CardHeader className="space-y-3 pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base font-semibold">Inspections Daily Monitor</CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2" onClick={handleMaximizeLeft}>
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Filters for Inspections Daily Monitor */}
                            <div className="flex items-end gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="inspections-from" className="text-xs">
                                        From
                                    </Label>
                                    <Popover open={openInspectionsFromDate} onOpenChange={setOpenInspectionsFromDate}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-9 w-[150px] justify-start gap-2 text-xs font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {inspectionsFromDate ? new Date(inspectionsFromDate).toLocaleDateString() : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={inspectionsFromDate ? new Date(inspectionsFromDate) : undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const pad = (n: number) => n.toString().padStart(2, '0');
                                                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                        setInspectionsFromDate(formatted);
                                                    }
                                                    setOpenInspectionsFromDate(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="inspections-to" className="text-xs">
                                        To
                                    </Label>
                                    <Popover open={openInspectionsToDate} onOpenChange={setOpenInspectionsToDate}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-9 w-[150px] justify-start gap-2 text-xs font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {inspectionsToDate ? new Date(inspectionsToDate).toLocaleDateString() : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={inspectionsToDate ? new Date(inspectionsToDate) : undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const pad = (n: number) => n.toString().padStart(2, '0');
                                                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                        setInspectionsToDate(formatted);
                                                    }
                                                    setOpenInspectionsToDate(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="inspections-status" className="text-xs">
                                        Status
                                    </Label>
                                    <Select value={selectedInspectionsStatus} onValueChange={setSelectedInspectionsStatus}>
                                        <SelectTrigger id="inspections-status" className="h-9 w-[120px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="for_inspection">For Inspection</SelectItem>
                                            <SelectItem value="for_inspection_approval">For Approval</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="disapproved">Disapproved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="reassigned">Reassigned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button size="sm" onClick={handleInspectionsFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                                    Filter
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleDownload} className="h-9 px-4 text-xs">
                                    Download
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="h-9 text-xs">Customer</TableHead>
                                            <TableHead className="h-9 text-xs">Status</TableHead>
                                            <TableHead className="h-9 text-xs">Customer Type</TableHead>
                                            <TableHead className="h-9 text-xs">Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerInspections.length > 0 ? (
                                            customerInspections.map((inspection) => (
                                                <TableRow key={inspection.id} className="text-xs">
                                                    <TableCell className="py-2 font-medium">{inspection.customer}</TableCell>
                                                    <TableCell className="py-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${getStatusColor(inspection.status)} text-xs font-medium`}
                                                        >
                                                            {getStatusLabel(inspection.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-2">{inspection.customer_type}</TableCell>
                                                    <TableCell className="py-2 text-xs">{inspection.address}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                                                    No inspections found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination for Customer Inspections */}
                            {customerInspectionsPagination.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <div className="text-xs text-muted-foreground">
                                        Showing {(customerInspectionsPagination.current_page - 1) * customerInspectionsPagination.per_page + 1} to{' '}
                                        {Math.min(
                                            customerInspectionsPagination.current_page * customerInspectionsPagination.per_page,
                                            customerInspectionsPagination.total,
                                        )}{' '}
                                        of {customerInspectionsPagination.total} results
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    size="sm"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (customerInspectionsPagination.current_page > 1) {
                                                            handleInspectionsPageChange(customerInspectionsPagination.current_page - 1);
                                                        }
                                                    }}
                                                    className={
                                                        customerInspectionsPagination.current_page === 1 ? 'pointer-events-none opacity-50' : ''
                                                    }
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: customerInspectionsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        size="sm"
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleInspectionsPageChange(page);
                                                        }}
                                                        isActive={page === customerInspectionsPagination.current_page}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    size="sm"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (customerInspectionsPagination.current_page < customerInspectionsPagination.last_page) {
                                                            handleInspectionsPageChange(customerInspectionsPagination.current_page + 1);
                                                        }
                                                    }}
                                                    className={
                                                        customerInspectionsPagination.current_page === customerInspectionsPagination.last_page
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Table: Inspector Applications Tracking */}
                    <Card className="flex flex-col">
                        <CardHeader className="space-y-3 pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base font-semibold">Inspector Applications Tracking</CardTitle>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2" onClick={handleMaximizeRight}>
                                    <Maximize2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Filters for Inspector Applications Tracking */}
                            <div className="flex items-end gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="applications-from" className="text-xs">
                                        From
                                    </Label>
                                    <Popover open={openApplicationsFromDate} onOpenChange={setOpenApplicationsFromDate}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-9 w-[140px] justify-start gap-2 text-xs font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {applicationsFromDate ? new Date(applicationsFromDate).toLocaleDateString() : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={applicationsFromDate ? new Date(applicationsFromDate) : undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const pad = (n: number) => n.toString().padStart(2, '0');
                                                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                        setApplicationsFromDate(formatted);
                                                    }
                                                    setOpenApplicationsFromDate(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="applications-to" className="text-xs">
                                        To
                                    </Label>
                                    <Popover open={openApplicationsToDate} onOpenChange={setOpenApplicationsToDate}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-9 w-[140px] justify-start gap-2 text-xs font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {applicationsToDate ? new Date(applicationsToDate).toLocaleDateString() : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={applicationsToDate ? new Date(applicationsToDate) : undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const pad = (n: number) => n.toString().padStart(2, '0');
                                                        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                        setApplicationsToDate(formatted);
                                                    }
                                                    setOpenApplicationsToDate(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="applications-inspector" className="text-xs">
                                        Inspector
                                    </Label>
                                    <Select value={selectedInspectorId} onValueChange={setSelectedInspectorId}>
                                        <SelectTrigger id="applications-inspector" className="h-9 w-[140px] text-xs">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-xs">
                                                All Inspectors
                                            </SelectItem>
                                            {inspectors.map((inspector) => (
                                                <SelectItem key={inspector.id} value={String(inspector.id)} className="text-xs">
                                                    {inspector.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button size="sm" onClick={handleApplicationsFilter} className="h-9 bg-green-900 px-4 text-xs hover:bg-green-700">
                                    Filter
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleDownload} className="h-9 px-4 text-xs">
                                    Download
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="h-9 text-xs">Customer</TableHead>
                                            <TableHead className="h-9 text-xs">Status</TableHead>
                                            <TableHead className="h-9 text-xs">Customer Type</TableHead>
                                            <TableHead className="h-9 text-xs">Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInspectorId && selectedInspectorId !== 'all' ? (
                                            inspectorApplications.length > 0 ? (
                                                inspectorApplications.map((inspection) => (
                                                    <TableRow key={inspection.id} className="text-xs">
                                                        <TableCell className="py-2 font-medium">{inspection.customer}</TableCell>
                                                        <TableCell className="py-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`${getStatusColor(inspection.status)} text-xs font-medium`}
                                                            >
                                                                {getStatusLabel(inspection.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-2">{inspection.customer_type}</TableCell>
                                                        <TableCell className="py-2 text-xs">{inspection.address}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                                                        No applications found for the selected inspector
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                                                    Please select an inspector to view applications
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination for Inspector Applications */}
                            {inspectorApplicationsPagination && inspectorApplicationsPagination.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <div className="text-xs text-muted-foreground">
                                        Showing {(inspectorApplicationsPagination.current_page - 1) * inspectorApplicationsPagination.per_page + 1} to{' '}
                                        {Math.min(
                                            inspectorApplicationsPagination.current_page * inspectorApplicationsPagination.per_page,
                                            inspectorApplicationsPagination.total,
                                        )}{' '}
                                        of {inspectorApplicationsPagination.total} results
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    size="sm"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (inspectorApplicationsPagination.current_page > 1) {
                                                            handleApplicationsPageChange(inspectorApplicationsPagination.current_page - 1);
                                                        }
                                                    }}
                                                    className={
                                                        inspectorApplicationsPagination.current_page === 1 ? 'pointer-events-none opacity-50' : ''
                                                    }
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: inspectorApplicationsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        size="sm"
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleApplicationsPageChange(page);
                                                        }}
                                                        isActive={page === inspectorApplicationsPagination.current_page}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    size="sm"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (
                                                            inspectorApplicationsPagination.current_page < inspectorApplicationsPagination.last_page
                                                        ) {
                                                            handleApplicationsPageChange(inspectorApplicationsPagination.current_page + 1);
                                                        }
                                                    }}
                                                    className={
                                                        inspectorApplicationsPagination.current_page === inspectorApplicationsPagination.last_page
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <InspectionDetailsModal open={modalOpen} onOpenChange={setModalOpen} inspections={modalData} title={modalTitle} />
        </AppLayout>
    );
}
