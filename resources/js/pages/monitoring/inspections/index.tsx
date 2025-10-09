import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Building2, Calendar, Download, Eye, Filter, MapPin, Search, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Inspection {
    id: number;
    status: string;
    house_loc?: string;
    meter_loc?: string;
    bill_deposit: number;
    material_deposit: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
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
    barangay?: {
        id: number;
        name: string;
        town?: {
            id: number;
            name: string;
        };
    };
    customer_type?: {
        id: number;
        name: string;
    };
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
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface PageProps {
    applications: PaginatedApplications;
    search?: string;
    [key: string]: unknown;
}

export default function InspectionIndex() {
    const { applications, search: initialSearch } = usePage<PageProps>().props;
    const [search, setSearch] = useState(initialSearch || '');
    const [statusFilter, setStatusFilter] = useState('');

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Inspections', href: route('inspections.index') },
    ];

    // Debounced search function
    const debouncedSearch = useCallback(
        (searchTerm: string) => {
            const params: { search: string; status?: string } = { search: searchTerm };
            if (statusFilter && statusFilter !== 'all') {
                params.status = statusFilter;
            }

            router.get(route('inspections.index'), params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [statusFilter],
    );

    useEffect(() => {
        if (search !== initialSearch) {
            const timeoutId = setTimeout(() => {
                debouncedSearch(search);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [search, debouncedSearch, initialSearch]);

    useEffect(() => {
        // Trigger search when status filter changes
        debouncedSearch(search);
    }, [statusFilter, debouncedSearch, search]);

    const handlePageChange = (url: string) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
            case 'completed':
                return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
            case 'in_progress':
                return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
            case 'scheduled':
                return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
        }
    };

    const getFullName = (application: CustomerApplication) => {
        const parts = [application.first_name, application.middle_name, application.last_name, application.suffix].filter(Boolean);
        return parts.join(' ');
    };

    const getFullAddress = (application: CustomerApplication) => {
        const addressParts = [application.barangay?.name, application.barangay?.town?.name].filter(Boolean);
        return addressParts.join(', ') || 'No address provided';
    };

    const getLatestInspection = (inspections: Inspection[]) => {
        return inspections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStats = () => {
        const total = applications.total;
        const pending = applications.data.filter((app) => {
            const latest = getLatestInspection(app.inspections);
            return latest?.status?.toLowerCase() === 'pending';
        }).length;
        const completed = applications.data.filter((app) => {
            const latest = getLatestInspection(app.inspections);
            return latest?.status?.toLowerCase() === 'completed';
        }).length;
        const inProgress = applications.data.filter((app) => {
            const latest = getLatestInspection(app.inspections);
            return latest?.status?.toLowerCase() === 'in progress' || latest?.status?.toLowerCase() === 'in_progress';
        }).length;

        return { total, pending, completed, inProgress };
    };

    const stats = getStats();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={'Inspections'} />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inspections</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Monitor and manage customer application inspections</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
                                </div>
                                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                                    <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    More Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Pending Applications</CardTitle>
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
                                        <TableHead className="font-semibold">Applied</TableHead>
                                        <TableHead className="w-20 font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.data.map((application) => {
                                        const latestInspection = getLatestInspection(application.inspections);
                                        return (
                                            <TableRow key={application.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="font-medium text-gray-900 dark:text-gray-100">#{application.id}</TableCell>
                                                <TableCell className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    {application.account_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-purple-600">
                                                            <span className="text-sm font-medium text-white">
                                                                {application.first_name.charAt(0)}
                                                                {application.last_name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">{getFullName(application)}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{application.email_address}</p>
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
                                                        className={`${getStatusColor(latestInspection?.status || 'pending')} font-medium transition-colors`}
                                                    >
                                                        {latestInspection?.status || 'pending'}
                                                    </Badge>
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
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <span className="hidden sm:inline">View</span>
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
                        return (
                            <Card key={application.id} className="shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                                <span className="text-sm font-medium text-white">
                                                    {application.first_name.charAt(0)}
                                                    {application.last_name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {getFullName(application)}
                                                </CardTitle>
                                                <p className="font-mono text-sm text-gray-500 dark:text-gray-400">#{application.account_number}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`${getStatusColor(latestInspection?.status || 'pending')} font-medium`}>
                                            {latestInspection?.status || 'pending'}
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
                                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{getFullAddress(application)}</p>
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

                                    <div className="pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full gap-2 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Inspection Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Pagination */}
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
            </div>
        </AppLayout>
    );
}
