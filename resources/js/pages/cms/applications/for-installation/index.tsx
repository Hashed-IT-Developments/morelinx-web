import Input from '@/components/composables/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, WhenVisible } from '@inertiajs/react';
import { Contact, File, Forward, MapPin, Search } from 'lucide-react';

import Button from '@/components/composables/button';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatSplitWords, getStatusColor } from '@/lib/utils';
import { useState } from 'react';

import AlertDialog from '@/components/composables/alert-dialog';
import { useCustomerApplicationMethod } from '@/hooks/useCustomerApplicationMethod';
import AssignLineman from './components/assign-lineman';

interface CustomerApplicationProps {
    applications: PaginatedData & {
        data: CustomerApplication[];
    };
    search: string;
}
export default function ForInstallation({ applications, search }: CustomerApplicationProps) {
    const [searchInput, setSearch] = useState(search ?? '');

    const { updateStatus } = useCustomerApplicationMethod();

    const [isOpenDeclineDialog, setIsOpenDeclineDialog] = useState(false);

    const handleSearch = () => {
        router.get(route('applications.for-installation'), { search: searchInput });
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    const breadcrumbs = [{ title: 'For Installation', href: '/applications/for-installation' }];

    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [isOpenAssignUser, setIsOpenAssignUser] = useState(false);

    const handleDeclineApplication = async () => {
        await updateStatus(selectedApplication?.id, 'for_inspection');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AssignLineman application={selectedApplication} isOpen={isOpenAssignUser} setIsOpen={setIsOpenAssignUser} />
            <AlertDialog
                isOpen={isOpenDeclineDialog}
                setIsOpen={setIsOpenDeclineDialog}
                title="Decline Application"
                description="Are you sure you want to decline this application? This action cannot be undone."
                onConfirm={() => {
                    handleDeclineApplication();
                }}
            />
            <Head title="For Installation" />
            <div className="flex justify-center p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                    className="flex w-full max-w-4xl gap-2"
                >
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search size={16} />}
                        placeholder="Search customer applications"
                        className="rounded-3xl"
                    />
                    <Button type="submit">
                        <Search />
                    </Button>
                </form>
            </div>

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
                                                            {custApp?.full_name || custApp?.identity}
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
                                        <TableData className="hidden truncate sm:block">{custApp?.full_name || custApp?.identity}</TableData>

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
                                        <TableData className="col-span-2 hidden flex-row gap-2 sm:flex">
                                            <Button
                                                variant="default"
                                                mode="info"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedApplication(custApp);
                                                    setIsOpenAssignUser(true);
                                                }}
                                            >
                                                Assign Line Man <Forward />
                                            </Button>

                                            <Button
                                                size="sm"
                                                mode="danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedApplication(custApp);
                                                    setIsOpenDeclineDialog(true);
                                                }}
                                            >
                                                Decline
                                            </Button>
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
            </section>
        </AppLayout>
    );
}
