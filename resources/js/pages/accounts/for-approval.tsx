import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { useDebounce } from '@/lib/utils';
import { router, WhenVisible } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApplicationForApprovalProps {
    accounts: PaginatedData & {
        data: CustomerApplication[];
    };
    search?: string;
}

export default function ApplicationForApproval({ accounts, search }: ApplicationForApprovalProps) {
    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get('/accounts', { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get('/accounts', { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);

    const [isOpenApprovalDialog, setIsOpenApprovalDialog] = useState(false);
    const [isOpenRejectionDialog, setIsOpenRejectionDialog] = useState(false);

    const handleApproveApplication = () => {
        router.post(`/accounts/${selectedAccountId}/approve`);
        setIsOpenApprovalDialog(true);
    };

    const handleRejectApplication = () => {
        router.post(`/accounts/${selectedAccountId}/reject`);
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
            <section className="mt-4 space-y-4 px-4">
                <div>
                    <Input icon={<Search size={14} />} placeholder="Search Accounts" onChange={handleSearchInputChange} value={searchInput} />
                </div>
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
                                                onClick={() => {
                                                    setIsOpenApprovalDialog(true);
                                                    setSelectedAccountId(account.id);
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                mode="danger"
                                                onClick={() => {
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
