import AppLayout from '@/layouts/app-layout';

import { getStatusColor } from '@/lib/status-utils';
import { cn, formatSplitWords } from '@/lib/utils';
import { router, WhenVisible } from '@inertiajs/react';

import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { Contact, File, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CustomerApplicationProps {
    applications: PaginatedData & { data: CustomerApplication[] };
    search?: string | null;
}

export default function CustomerApplications({ applications, search = null }: CustomerApplicationProps) {
    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const debouncedSearch = useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get('/applications', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        if (searchInput === (search ?? '')) return;

        const timeoutId = setTimeout(() => {
            debouncedSearch(searchInput);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchInput, debouncedSearch, search]);

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    return (
        <AppLayout title="Dashboard" breadcrumbs={breadcrumbs} className="overflow-y-hidden">
            <SectionHeader className="flex justify-center">
                <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-4xl gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search size={16} />}
                        className="rounded-3xl"
                        placeholder="Search applications"
                    />
                </form>
            </SectionHeader>

            <SectionContent className="overflow-hidden">
                <Table>
                    <TableHeader col={6}>
                        <TableData>Account #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Contact</TableData>
                        <TableData>Type</TableData>
                        <TableData className="col-span-2 w-full justify-center">Status</TableData>
                    </TableHeader>
                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-18rem)]">
                        <WhenVisible
                            data="applications"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {!applications ? (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">No applications found.</span>
                                </div>
                            ) : (
                                applications?.data?.map((custApp: CustomerApplication) => (
                                    <TableRow key={custApp.id} col={6} onClick={() => handleSelectApplication(custApp?.id)}>
                                        <TableData className="grid grid-cols-2 sm:hidden">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-purple-600 text-white">
                                                        {custApp?.first_name?.charAt(0)}
                                                        {custApp?.last_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <h1 className="flex max-w-md text-lg leading-tight font-medium break-words text-gray-900">
                                                        {custApp?.identity}
                                                    </h1>

                                                    <span>{custApp?.account_number}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <Badge
                                                    className={cn(
                                                        'font-medium1 text-sm',
                                                        custApp.status
                                                            ? getStatusColor(custApp.status)
                                                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                    )}
                                                >
                                                    {formatSplitWords(custApp.status)}
                                                </Badge>
                                            </div>
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={custApp?.account_number}>
                                            {custApp?.account_number}
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={custApp?.full_name || custApp?.identity}>
                                            {custApp?.identity}
                                        </TableData>

                                        <TableData className="col-span-2 truncate" tooltip={custApp?.full_address}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex max-w-60 flex-col leading-tight break-words">
                                                    <span>{custApp?.full_address}</span>
                                                </div>
                                            </div>
                                        </TableData>

                                        <TableData
                                            className="col-span-2 truncate"
                                            tooltip={(custApp?.email_address ?? '') + ' ' + (custApp?.tel_no_1 ?? '')}
                                        >
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <Contact size={12} />
                                                    Contact:
                                                </span>
                                                <div className="flex max-w-60 flex-col leading-tight break-words">
                                                    <span className="truncate">{custApp?.email_address}</span>
                                                    <span className="truncate">{custApp?.tel_no_1}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="truncate" tooltip={custApp?.customer_type?.full_text}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <File size={12} />
                                                    Type:
                                                </span>
                                                <span className="truncate">{custApp?.customer_type?.full_text}</span>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 hidden w-full justify-center sm:flex">
                                            <Badge
                                                className={cn(
                                                    'font-medium1 text-sm',
                                                    custApp.status
                                                        ? getStatusColor(custApp.status)
                                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                )}
                                            >
                                                {formatSplitWords(custApp.status)}
                                            </Badge>
                                        </TableData>
                                    </TableRow>
                                ))
                            )}
                        </WhenVisible>
                    </TableBody>
                    <TableFooter>
                        <Pagination search={searchInput} pagination={applications} />
                    </TableFooter>
                </Table>
            </SectionContent>
        </AppLayout>
    );
}
