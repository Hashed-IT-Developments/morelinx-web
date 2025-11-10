import Input from '@/components/composables/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, WhenVisible } from '@inertiajs/react';
import { Contact, File, Forward, MapPin, Search } from 'lucide-react';

import Button from '@/components/composables/button';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatSplitWords, getStatusColor, useDebounce } from '@/lib/utils';
import { useEffect, useState } from 'react';
import AssignUser from './components/assign-user';

interface CustomerApplicationProps {
    applications: PaginatedData & {
        data: CustomerApplication[];
    };
    search: string;
}
export default function ForInstallation({ applications, search }: CustomerApplicationProps) {
    console.log('applications', applications);
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get(route('applications.for-installation'), { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get(route('applications.for-installation'), { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    const breadcrumbs = [{ title: 'For Installation', href: '/applications/for-installation' }];

    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [isOpenAssignUser, setIsOpenAssignUser] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AssignUser application={selectedApplication} isOpen={isOpenAssignUser} setIsOpen={setIsOpenAssignUser} />
            <Head title="For Installation" />
            <section className="mt-4 px-4">
                <div>
                    <Input
                        icon={<Search size={14} />}
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        placeholder="Search customer applications"
                    />
                </div>
            </section>

            <section className="mt-4 px-4">
                <Table>
                    <TableHeader col={6}>
                        <TableData>Account #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Email</TableData>
                        <TableData>Type</TableData>
                        <TableData>Action</TableData>
                    </TableHeader>
                    <TableBody className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-17rem)]">
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
                                            <Button
                                                variant="default"
                                                mode="danger"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedApplication(custApp);
                                                    setIsOpenAssignUser(true);
                                                }}
                                            >
                                                User <Forward />
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
