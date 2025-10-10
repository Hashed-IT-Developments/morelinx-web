import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationStatusEnum } from '@/enums/ApplicationStatusEnum';
import { InspectionStatusEnum } from '@/enums/InspectionStatusEnum';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Download, Eye, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import AssignInspectorDialog from './assign-inspector-dialog';
import ScheduleCalendar from './schedule-calendar';

// Use non-empty string for "All" options to avoid Select.Item error
const ALL_APPLICATION_STATUS = '__all__';
const ALL_INSPECTION_STATUS = '__all__';

// --- Unified Inspection interface ---
interface Inspection {
    id: number;
    status: string;
    created_at: string;
    updated_at: string;
    schedule_date?: string;
    inspector_id?: number | null;
    inspector?: { id: number; name: string } | null;
    bill_deposit: number;
    material_deposit: number;
    remarks?: string;
    house_loc?: string;
    meter_loc?: string;
}

interface Inspector {
    id: number;
    name: string;
}

interface CustomerApplication {
    id: number;
    account_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    email_address?: string;
    mobile_1?: string;
    created_at: string;
    barangay?: { id: number; name: string; town?: { id: number; name: string } };
    customer_type?: { id: number; name: string };
    status: string;
    inspections: Inspection[];
}

interface PaginatedApplications {
    data: CustomerApplication[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links: Array<{ url?: string; label: string; active: boolean }>;
}

interface PageProps {
    applications: PaginatedApplications;
    search?: string;
    inspectors: Inspector[];
    applicationStatus?: string;
    inspectionStatus?: string;
    [key: string]: unknown;
}

const applicationStatusOptions = [
    { value: ALL_APPLICATION_STATUS, label: 'All Application Status' },
    { value: ApplicationStatusEnum.IN_PROCESS, label: 'In Process' },
    { value: ApplicationStatusEnum.FOR_CCD_APPROVAL, label: 'For CCD Approval' },
    { value: ApplicationStatusEnum.FOR_INSPECTION, label: 'For Inspection' },
    { value: ApplicationStatusEnum.FOR_VERIFICATION, label: 'For Verification' },
    { value: ApplicationStatusEnum.FOR_COLLECTION, label: 'For Collection' },
    { value: ApplicationStatusEnum.FOR_SIGNING, label: 'For Signing' },
    { value: ApplicationStatusEnum.FOR_INSTALLATION_APPROVAL, label: 'For Installation Approval' },
    { value: ApplicationStatusEnum.ACTIVE, label: 'Active' },
];

const inspectionStatusOptions = [
    { value: ALL_INSPECTION_STATUS, label: 'All Inspection Status' },
    { value: InspectionStatusEnum.FOR_APPROVAL, label: 'For Approval' },
    { value: InspectionStatusEnum.APPROVED, label: 'Approved' },
    { value: InspectionStatusEnum.DISAPPROVED, label: 'Disapproved' },
];

export default function InspectionIndex() {
    const {
        applications,
        search: initialSearch,
        inspectors,
        applicationStatus: initialAppStatus = ALL_APPLICATION_STATUS,
        inspectionStatus: initialInspStatus = ALL_INSPECTION_STATUS,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(initialSearch || '');
    const [applicationStatus, setApplicationStatus] = useState(initialAppStatus || ALL_APPLICATION_STATUS);
    const [inspectionStatus, setInspectionStatus] = useState(initialInspStatus || ALL_INSPECTION_STATUS);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    // Stats calculation
    const allApplications = applications.total;
    const forInspection = applications.data.filter((app) => app.status === ApplicationStatusEnum.FOR_INSPECTION).length;
    const forApproval = applications.data.filter((app) => app.inspections.some((ins) => ins.status === InspectionStatusEnum.FOR_APPROVAL)).length;
    const rejected = applications.data.filter((app) => app.inspections.some((ins) => ins.status === InspectionStatusEnum.DISAPPROVED)).length;

    // Debounced search and filter
    const debouncedSearch = useCallback((searchTerm: string, appStatus: string, inspStatus: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (appStatus && appStatus !== ALL_APPLICATION_STATUS) params.application_status = appStatus;
        if (inspStatus && inspStatus !== ALL_INSPECTION_STATUS) params.inspection_status = inspStatus;

        router.get(route('inspections.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search, applicationStatus, inspectionStatus);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, applicationStatus, inspectionStatus, debouncedSearch]);

    const handleDialogOpenChange = (open: boolean) => {
        setAssignDialogOpen(open);
        if (!open) setHighlightedId(null);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case ApplicationStatusEnum.IN_PROCESS:
                return 'In Process';
            case ApplicationStatusEnum.FOR_CCD_APPROVAL:
                return 'For CCD Approval';
            case ApplicationStatusEnum.FOR_INSPECTION:
                return 'For Inspection';
            case ApplicationStatusEnum.FOR_VERIFICATION:
                return 'For Verification';
            case ApplicationStatusEnum.FOR_COLLECTION:
                return 'For Collection';
            case ApplicationStatusEnum.FOR_SIGNING:
                return 'For Signing';
            case ApplicationStatusEnum.FOR_INSTALLATION_APPROVAL:
                return 'For Installation Approval';
            case ApplicationStatusEnum.ACTIVE:
                return 'Active';
            case InspectionStatusEnum.FOR_APPROVAL:
                return 'For Approval';
            case InspectionStatusEnum.APPROVED:
                return 'Approved';
            case InspectionStatusEnum.DISAPPROVED:
                return 'Disapproved';
            default:
                return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case ApplicationStatusEnum.IN_PROCESS:
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
            case ApplicationStatusEnum.FOR_CCD_APPROVAL:
            case ApplicationStatusEnum.FOR_INSPECTION:
            case ApplicationStatusEnum.FOR_VERIFICATION:
            case ApplicationStatusEnum.FOR_COLLECTION:
            case ApplicationStatusEnum.FOR_SIGNING:
            case ApplicationStatusEnum.FOR_INSTALLATION_APPROVAL:
            case InspectionStatusEnum.FOR_APPROVAL:
                return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
            case ApplicationStatusEnum.ACTIVE:
            case InspectionStatusEnum.APPROVED:
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
            case InspectionStatusEnum.DISAPPROVED:
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
        }
    };

    const getFullName = (a: CustomerApplication) => [a.first_name, a.middle_name, a.last_name, a.suffix].filter(Boolean).join(' ');

    const getFullAddress = (a: CustomerApplication) => [a.barangay?.name, a.barangay?.town?.name].filter(Boolean).join(', ') || 'No address provided';

    const getLatestInspection = (inspections: Inspection[]) =>
        inspections && inspections.length
            ? inspections.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : undefined;

    const canAssignInspector = (inspection: Inspection | undefined) => {
        if (!inspection) return false;
        if (inspection.inspector_id !== null && inspection.inspector_id !== undefined) return false;
        if (!inspection.schedule_date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const schedDate = new Date(inspection.schedule_date ?? '');
        schedDate.setHours(0, 0, 0, 0);
        return schedDate < today;
    };

    const formatDate = (dateString?: string) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    const getDisplayStatus = (application: CustomerApplication, latestInspection: Inspection | undefined) =>
        latestInspection && latestInspection.inspector_id ? latestInspection.status : application.status;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Inspections', href: route('inspections.index') },
            ]}
        >
            <Head title={'Inspections'} />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">All Applications</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{allApplications}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">For Inspection</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{forInspection}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">For Approval</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{forApproval}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rejected}</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                    <Eye className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by customer name, account number..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 pr-10 pl-10"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            className="absolute top-2.5 right-3 flex h-5 w-5 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                                            onClick={() => setSearch('')}
                                            aria-label="Clear search"
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by application status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {applicationStatusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={inspectionStatus} onValueChange={setInspectionStatus}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by inspection status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inspectionStatusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table View */}
                <Tabs defaultValue="table" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table" className="space-y-6">
                        <div className="hidden lg:block">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold">Applications</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                                <TableHead className="w-16 font-semibold">ID</TableHead>
                                                <TableHead className="font-semibold">Account Number</TableHead>
                                                <TableHead className="font-semibold">Customer</TableHead>
                                                <TableHead className="hidden font-semibold xl:table-cell">Address</TableHead>
                                                <TableHead className="font-semibold">Type</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Inspector</TableHead>
                                                <TableHead className="font-semibold">Scheduled Date</TableHead>
                                                <TableHead className="font-semibold">Applied</TableHead>
                                                <TableHead className="w-20 font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.data.map((application) => {
                                                const latestInspection = getLatestInspection(application.inspections);
                                                const isHighlighted = application.id === highlightedId;
                                                const displayStatus = getDisplayStatus(application, latestInspection);
                                                return (
                                                    <TableRow
                                                        key={application.id}
                                                        className={isHighlighted ? 'bg-blue-100 transition-colors dark:bg-blue-900/40' : ''}
                                                    >
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            #{application.id}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                                                            {application.account_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-purple-600">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {(application.first_name || '').charAt(0)}
                                                                        {(application.last_name || '').charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {getFullName(application)}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {application.email_address}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden xl:table-cell">
                                                            <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                                <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                                <span className="line-clamp-2">{getFullAddress(application)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                                {application.customer_type?.name || 'N/A'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={`${getStatusColor(displayStatus)} font-medium transition-colors`}
                                                            >
                                                                {getStatusLabel(displayStatus)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {latestInspection?.inspector?.name || <span className="text-gray-400">—</span>}
                                                        </TableCell>
                                                        <TableCell>
                                                            {latestInspection?.schedule_date ? (
                                                                formatDate(latestInspection.schedule_date)
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(application.created_at)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                                onClick={() => {
                                                                    setSelectedApplicationId(application.id);
                                                                    setAssignDialogOpen(true);
                                                                    setHighlightedId(application.id);
                                                                }}
                                                                disabled={!canAssignInspector(latestInspection)}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span className="hidden sm:inline">Assign Inspector</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="calendar" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold">Inspection Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScheduleCalendar applications={applications} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <AssignInspectorDialog
                    open={assignDialogOpen}
                    onOpenChange={handleDialogOpenChange}
                    applicationId={selectedApplicationId}
                    inspectors={inspectors}
                />
                <Toaster />
            </div>
        </AppLayout>
    );
}
