import Input from '@/components/composables/input';
import AppLayout from '@/layouts/app-layout';
import { router, WhenVisible } from '@inertiajs/react';
import { File, Forward, MapPin, Search } from 'lucide-react';

import Button from '@/components/composables/button';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatSplitWords, getStatusColor } from '@/lib/utils';
import { useState } from 'react';

import AccountSummaryDialog from '@/components/account-summary-dialog';
import AlertDialog from '@/components/composables/alert-dialog';
import AssignLineman from './components/assign-lineman';

interface CustomerApplicationProps {
    applications: PaginatedData & {
        data: CustomerApplication[];
    };
    search: string;
    status: string;
}

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ViewEnergization from './components/view-energization';

export default function ForInstallation({ applications, search, status }: CustomerApplicationProps) {
    const [searchInput, setSearch] = useState(search ?? '');

    const [remarks, setRemarks] = useState('');

    const [isOpenDeclineDialog, setIsOpenDeclineDialog] = useState(false);
    const [isOpenApproveDialog, setIsOpenApproveDialog] = useState(false);

    const handleSearch = () => {
        router.get(route('applications.for-installation'), { search: searchInput });
    };

    const handleSelectApplication = (application: CustomerApplication) => {
        // If application has an account, show account summary
        if (application.account?.id) {
            setSelectedAccountId(application.account.id);
            setIsOpenAccountSummary(true);
        } else {
            // Otherwise, navigate to application details
            router.visit('/applications/' + application.id);
        }
    };

    const breadcrumbs = [{ title: 'Installations', href: '/applications/for-installation' }];

    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [isOpenAssignUser, setIsOpenAssignUser] = useState(false);

    const handleTabChange = (status: string) => {
        router.get(route('applications.get-installation-by-status', { status: status }));
    };

    const [isOpenViewEnergization, setIsOpenViewEnergization] = useState(false);

    const [selectedEnergization, setSelectedEnergization] = useState<Energization | null>(null);

    const [isOpenAccountSummary, setIsOpenAccountSummary] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    const handleSelectEnergization = (energization: Energization) => {
        setSelectedEnergization(energization);
        setIsOpenViewEnergization(true);
    };

    const handleDeclineInstallation = async () => {
        await router.patch(
            route('customer-applications.decline-installation'),
            {
                energization_id: selectedEnergization?.id,
                remarks: remarks,
            },
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSuccess: (response: any) => {
                    toast.success(response?.props?.flash?.success);
                },
            },
        );
    };

    const handleApproveInstallation = async () => {
        await router.patch(
            route('customer-applications.approve-installation'),
            {
                application_id: selectedApplication?.id,
            },
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSuccess: (response: any) => {
                    toast.success(response?.props?.flash?.success);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} title="Installations">
            <ViewEnergization isOpen={isOpenViewEnergization} setIsOpen={setIsOpenViewEnergization} energization={selectedEnergization} />
            <AccountSummaryDialog accountId={selectedAccountId} open={isOpenAccountSummary} onOpenChange={setIsOpenAccountSummary} />
            <AssignLineman application={selectedApplication} isOpen={isOpenAssignUser} setIsOpen={setIsOpenAssignUser} />
            <AlertDialog
                isOpen={isOpenDeclineDialog}
                setIsOpen={setIsOpenDeclineDialog}
                title="Decline Energization"
                description="Are you sure you want to decline this energization? This action cannot be undone."
                setRemarks={setRemarks}
                onConfirm={() => {
                    handleDeclineInstallation();
                }}
            />

            <AlertDialog
                isOpen={isOpenApproveDialog}
                setIsOpen={setIsOpenApproveDialog}
                title="Approve Installation"
                description="Are you sure you want to approve this installation? This action cannot be undone."
                onConfirm={() => {
                    handleApproveInstallation();
                }}
            />

            <div className="flex justify-center p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                    className="flex w-full max-w-4xl items-center gap-2"
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
                <Tabs
                    defaultValue={status || 'pending'}
                    className="mb-4 w-full"
                    onValueChange={(value) => {
                        handleTabChange(value);
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="for_installation_approval">Approval</TabsTrigger>
                        <TabsTrigger value="assigned">Assigned</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="not_completed">Not Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Table>
                    <TableHeader col={6}>
                        <TableData>Account #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        {status === 'assigned' && <TableData>Assigned Lineman</TableData>}
                        <TableData>Type</TableData>
                        <TableData>Action</TableData>
                    </TableHeader>
                    <TableBody className="h-[calc(100vh-18rem)] sm:h-[calc(100vh-22rem)]">
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
                                    <TableRow key={custApp.id} col={6} className="grid-cols-3" onClick={() => handleSelectApplication(custApp)}>
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
                                                            {custApp?.identity}
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

                                        <TableData className="hidden sm:block">{custApp?.account_number}</TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={custApp?.full_name}>
                                            {custApp?.identity}
                                        </TableData>

                                        <TableData className="col-span-2 truncate" tooltip={custApp?.full_address}>
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
                                        <TableData className="col-span-2 truncate" tooltip={custApp.energization?.team_assigned?.name}>
                                            {custApp.energization?.team_assigned?.name}
                                        </TableData>

                                        <TableData className="col-span-2 truncate" tooltip={custApp?.customer_type?.full_text}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <File size={12} />
                                                    Type:
                                                </span>
                                                <span className="truncate">{custApp?.customer_type?.full_text}</span>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 hidden flex-row gap-2 sm:flex">
                                            {status === 'for_installation_approval' && (
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
                                            )}

                                            {custApp?.energization?.status === 'installed' && (
                                                <Button
                                                    variant="default"
                                                    mode="info"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleSelectEnergization(custApp.energization!);
                                                    }}
                                                >
                                                    View Energization
                                                </Button>
                                            )}

                                            {custApp?.energization?.status === 'completed' && custApp?.status !== 'completed' && (
                                                <Button
                                                    size="sm"
                                                    mode="success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setSelectedApplication(custApp);
                                                        setIsOpenApproveDialog(true);
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                mode="danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedEnergization(custApp.energization!);
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
