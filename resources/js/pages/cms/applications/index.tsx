import AppLayout from '@/layouts/app-layout';

import { cn, formatSplitWords, getStatusColor, useDebounce } from '@/lib/utils';
import { Head, router, WhenVisible } from '@inertiajs/react';

import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { EllipsisVertical, Search } from 'lucide-react';

import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { useEffect, useState } from 'react';

interface CustomerApplicationProps {
    applications: PaginatedData & { data: CustomerApplication[] };
    search?: string | null;
}

export default function CustomerApplications({ applications, search = null }: CustomerApplicationProps) {
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
                    <TableHeader col={5}>
                        <div>Account #</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Type</div>
                        <div>Status</div>
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
                                    <TableRow key={custApp.id} col={5} onClick={() => handleSelectApplication(custApp?.id)}>
                                        <TableData>{custApp?.account_number}</TableData>
                                        <TableData>
                                            {custApp?.first_name} {custApp?.middle_name} {custApp?.last_name} {custApp?.suffix}
                                        </TableData>
                                        <TableData>{custApp?.email_address}</TableData>
                                        <TableData>{custApp?.customer_type?.full_text}</TableData>
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
                                        <TableData className="absolute top-0 right-0 p-2">
                                            <Button variant="ghost" className="cursor-pointer">
                                                <EllipsisVertical />
                                            </Button>
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
