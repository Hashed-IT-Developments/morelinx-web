import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Download, Eye, MapPin, Search, Building2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import AssignInspectorDialog from './assign-inspector-dialog';
import ScheduleCalendar from './schedule-calendar';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

// --- Interfaces ---
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
    statuses: string[];
    selectedStatus: string;
    statusCounts: Record<string, number>;
    [key: string]: unknown;
}

const DEFAULT_STATUS = 'FOR_INSPECTION';

export default function InspectionIndex() {
    const {
        applications,
        search: initialSearch,
        inspectors,
        statuses,
        selectedStatus,
        statusCounts,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(initialSearch || '');
    const [status, setStatus] = useState(selectedStatus || DEFAULT_STATUS);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    // Only these three statuses and all applications
    const statusCards = [
        {
            label: 'All Applications',
            key: 'ALL',
            icon: Download,
            border: 'border-l-blue-500',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        ...statuses.map((key) => {
            let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let border = 'border-l-blue-500';
            let bg = 'bg-blue-50';
            let iconColor = 'text-blue-600 dark:text-blue-400';
            let icon = Calendar;
            if (key.toLowerCase().includes('inspection')) {
                label = 'For Inspection';
            } else if (key.toLowerCase().includes('verification')) {
                label = 'For Verification';
            } else if (key.toLowerCase().includes('process')) {
                label = 'In Process';
            }
            return { label, key, icon, border, bg, iconColor };
        }),
    ];

    // Debounced search and filter
    const debouncedSearch = useCallback((searchTerm: string, stat: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (stat) params.status = stat;

        router.get(route('inspections.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search, status);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, status, debouncedSearch]);

    const handleDialogOpenChange = (open: boolean) => {
        setAssignDialogOpen(open);
        if (!open) setHighlightedId(null);
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const getStatusLabel = (status: string) =>
        status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

    const getStatusColor = (status: string) => {
        if (!status) return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
        const s = status.toLowerCase();
        if (s.includes('reject') || s.includes('disapprove')) {
            return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
        }
        if (s.includes('approval')) {
            return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        }
        if (s.includes('inspection')) {
            return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        }
        if (s.includes('verification')) {
            return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        }
        if (s.includes('process')) {
            return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        }
        if (s.includes('active') || s.includes('approved')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
        }
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    };

    const getFullName = (a: CustomerApplication) =>
        [a.first_name, a.middle_name, a.last_name, a.suffix].filter(Boolean).join(' ');

    const getFullAddress = (a: CustomerApplication) =>
        [a.barangay?.name, a.barangay?.town?.name].filter(Boolean).join(', ') || 'No address provided';

    const getLatestInspection = (inspections: Inspection[]) =>
        inspections && inspections.length
            ? inspections.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : undefined;

    const canAssignInspector = (
        application: CustomerApplication,
        inspection: Inspection | undefined
    ) => {
        if ((application.status || '').trim().toUpperCase() !== 'FOR_INSPECTION') return false;
        if (!inspection) return false;
        if (inspection.inspector_id !== null && inspection.inspector_id !== undefined) return false;
        return true;
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
                    {statusCards.map((card, idx) => (
                        <Card key={idx} className={card.border}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {statusCounts[card.key] ?? 0}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg ${card.bg} p-2 dark:bg-blue-900/20`}>
                                        <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((stat) => (
                                            <SelectItem key={stat} value={stat}>
                                                {getStatusLabel(stat)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                                                disabled={!canAssignInspector(application, latestInspection)}
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

                        {/* Mobile/Tablet Card View */}
                        <div className="space-y-4 lg:hidden">
                            {applications.data.map((application) => {
                                const latestInspection = getLatestInspection(application.inspections);
                                const displayStatus = getDisplayStatus(application, latestInspection);
                                const isHighlighted = application.id === highlightedId;
                                return (
                                    <Card
                                        key={application.id}
                                        className={`shadow-sm transition-shadow hover:shadow-md ${
                                            isHighlighted ? 'border-blue-400 ring-2 ring-blue-200 dark:ring-blue-400' : ''
                                        }`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-purple-600">
                                                        <span className="text-sm font-medium text-white">
                                                            {(application.first_name || '').charAt(0)}
                                                            {(application.last_name || '').charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {getFullName(application)}
                                                        </CardTitle>
                                                        <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                                            #{application.account_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`${getStatusColor(displayStatus)} font-medium`}
                                                >
                                                    {getStatusLabel(displayStatus)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Building2 className="h-3 w-3" />
                                                        <span className="font-medium">Type:</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-gray-100">{application.customer_type?.name || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="font-medium">Applied:</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-gray-100">{formatDate(application.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-sm font-medium">Address:</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {getFullAddress(application)}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <User className="h-3 w-3" />
                                                    <span className="text-sm font-medium">Contact:</span>
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                    {application.email_address && <p>{application.email_address}</p>}
                                                    {application.mobile_1 && <p>{application.mobile_1}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Inspector:</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-gray-100">
                                                        {latestInspection?.inspector?.name || <span className="text-gray-400">—</span>}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Scheduled:</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-gray-100">
                                                        {latestInspection?.schedule_date
                                                            ? formatDate(latestInspection.schedule_date)
                                                            : <span className="text-gray-400">—</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full gap-2 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => {
                                                        setSelectedApplicationId(application.id);
                                                        setAssignDialogOpen(true);
                                                        setHighlightedId(application.id);
                                                    }}
                                                    disabled={!canAssignInspector(application, latestInspection)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Assign Inspector
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {/* Pagination - Only shown in table view */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing <span className="font-medium text-gray-900 dark:text-gray-100">{applications.from || 0}</span> to{' '}
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{applications.to || 0}</span> of{' '}
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{applications.total}</span> applications
                                    </div>

                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const prevLink = applications.links.find((link) => link.label === '&laquo; Previous');
                                                        if (prevLink?.url) {
                                                            handlePageChange(prevLink.url);
                                                        }
                                                    }}
                                                    className={
                                                        applications.current_page === 1
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                />
                                            </PaginationItem>

                                            {applications.links.slice(1, -1).map((link, index) => {
                                                if (link.label === '...') {
                                                    return (
                                                        <PaginationItem key={`ellipsis-${index}`}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }

                                                return (
                                                    <PaginationItem key={link.label}>
                                                        <PaginationLink
                                                            href="#"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (link.url) {
                                                                    handlePageChange(link.url);
                                                                }
                                                            }}
                                                            isActive={link.active}
                                                            className={`cursor-pointer transition-colors ${
                                                                link.active
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                            }`}
                                                        >
                                                            {link.label}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const nextLink = applications.links.find((link) => link.label === 'Next &raquo;');
                                                        if (nextLink?.url) {
                                                            handlePageChange(nextLink.url);
                                                        }
                                                    }}
                                                    className={
                                                        applications.current_page === applications.last_page
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </CardContent>
                        </Card>
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