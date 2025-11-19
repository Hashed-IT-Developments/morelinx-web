import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { router, WhenVisible } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ApplicationForApprovalProps {
    accounts: PaginatedData & {
        data: CustomerApplication[];
    };
    search?: string;
}

export default function ApplicationForApproval({ accounts, search }: ApplicationForApprovalProps) {
    const breadcrumbs = [{ title: 'Activation', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const handleSearch = () => {
        router.get('/accounts/status/for-approval', { search: searchInput });
    };

    const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);

    const [isOpenApprovalDialog, setIsOpenApprovalDialog] = useState(false);
    const [isOpenRejectionDialog, setIsOpenRejectionDialog] = useState(false);

    const handleApproveApplication = () => {
        router.patch(
            `/account/${selectedAccountId}/approve`,
            {},
            {
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSuccess: (page: any) => {
                    toast.success(page?.props?.flash?.success || 'Account application approved successfully.');
                    setIsOpenApprovalDialog(false);
                },
            },
        );
        setIsOpenApprovalDialog(true);
    };

    const handleRejectApplication = () => {
        router.patch(`/account/${selectedAccountId}/reject`);
        setIsOpenRejectionDialog(true);
    };

    const handleViewApplication = (id: string | number) => {
        router.visit('/applications/' + id);
    };

    return (
        <AppLayout title="Accounts" breadcrumbs={breadcrumbs}>
            <AlertDialog
                isOpen={isOpenApprovalDialog}
                setIsOpen={setIsOpenApprovalDialog}
                title="Approve Account"
                description="Are you sure you want to approve this account application?"
                onConfirm={() => {
                    handleApproveApplication();
                }}
            />
            <AlertDialog
                isOpen={isOpenRejectionDialog}
                setIsOpen={setIsOpenRejectionDialog}
                title="Reject Account"
                description="Are you sure you want to reject this account application?"
                onConfirm={() => {
                    handleRejectApplication();
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
                        className="rounded-3xl"
                        placeholder="Search applications"
                    />
                    <Button type="submit">
                        <Search />
                    </Button>
                </form>
            </div>

            <section className="mt-4 space-y-4 px-4">
                <Table>
                    <TableHeader col={5}>
                        <TableData>Name</TableData>
                        <TableData>Type</TableData>
                        <TableData>Address</TableData>
                        <TableData>Status</TableData>
                        <TableData>Action</TableData>
                    </TableHeader>

                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-17rem)]">
                        <WhenVisible
                            data="accounts"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {!(accounts?.data.length > 0) ? (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">No applications found.</span>
                                </div>
                            ) : (
                                accounts?.data.map((account: CustomerApplication) => (
                                    <TableRow
                                        key={account.id}
                                        col={5}
                                        onClick={() => {
                                            handleViewApplication(account.id);
                                        }}
                                    >
                                        <TableData>
                                            {account.first_name} {account.last_name}
                                        </TableData>
                                        <TableData>{account.customer_type.full_text}</TableData>
                                        <TableData>{account.full_address}</TableData>
                                        <TableData>{account.status}</TableData>
                                        <TableData className="flex gap-2">
                                            <Button
                                                mode="success"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsOpenApprovalDialog(true);
                                                    setSelectedAccountId(account.id);
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                mode="danger"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsOpenRejectionDialog(true);
                                                    setSelectedAccountId(account.id);
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </TableData>
                                    </TableRow>
                                ))
                            )}
                        </WhenVisible>
                    </TableBody>

                    <TableFooter>
                        <Pagination pagination={accounts} />
                    </TableFooter>
                </Table>
            </section>
        </AppLayout>
    );
}
