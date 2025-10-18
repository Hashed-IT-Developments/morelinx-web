import AppLayout from '@/layouts/app-layout';

import { cn, formatSplitWords, getStatusColor, useDebounce } from '@/lib/utils';
import { Head, router, WhenVisible } from '@inertiajs/react';

import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { Contact, File, MapPin, Search } from 'lucide-react';

import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface CustomerApplicationProps {
    applications: PaginatedData & { data: CustomerApplication[] };
    search?: string | null;
}

export default function CustomerApplications({ applications, search = null }: CustomerApplicationProps) {
    console.log('applications', applications);
    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get('/applications', { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get('/applications', { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex justify-center p-4">
                <div className="w-full max-w-4xl gap-3">
                    <Input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        icon={<Search size={16} />}
                        className="rounded-3xl"
                        placeholder="Search applications"
                    />
                </div>
            </div>

            <section className="px-4">
                <Table>
                    <TableHeader col={6}>
                        <TableData>Account #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Email</TableData>
                        <TableData>Type</TableData>
                        <TableData>Status</TableData>
                    </TableHeader>
                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-17rem)]">
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
                                    <TableRow key={custApp.id} col={6} className="grid-cols-3" onClick={() => handleSelectApplication(custApp?.id)}>
                                        <TableData className="col-span-2 sm:hidden">
                                            <section className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-purple-600 text-white">
                                                            {custApp?.first_name?.charAt(0)}
                                                            {custApp?.last_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <h1 className="flex max-w-md text-lg leading-tight font-medium break-words text-gray-900">
                                                            {custApp?.first_name} {custApp?.middle_name} {custApp?.last_name} {custApp?.suffix}
                                                        </h1>

                                                        <span>
                                                            <TableData className="col-span-2">{custApp?.account_number}</TableData>
                                                        </span>
                                                    </div>
                                                </div>

                                                <TableData>
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
                                            </section>
                                        </TableData>
                                        <TableData className="hidden truncate sm:block">{custApp?.account_number}</TableData>
                                        <TableData className="hidden truncate sm:block">
                                            {custApp?.first_name} {custApp?.middle_name} {custApp?.last_name} {custApp?.suffix}
                                        </TableData>

                                        <TableData>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex flex-col truncate">
                                                    <span>{custApp?.full_address}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 truncate">
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <Contact size={12} />
                                                    Contact:
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="truncate">{custApp?.email_address}</span>
                                                    <span className="truncate">{custApp?.tel_no_1}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 truncate">
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <File size={12} />
                                                    Type:
                                                </span>
                                                <span className="truncate">{custApp?.customer_type?.full_text}</span>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 hidden truncate sm:block">
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
                        <Pagination search={debouncedSearch} pagination={applications} />
                    </TableFooter>
                </Table>
            </section>
        </AppLayout>
    );
}
