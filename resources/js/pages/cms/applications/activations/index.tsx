import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import ComprehensiveSummaryDialog from '@/components/comprehensive-summary-dialog';
import AppLayout from '@/layouts/app-layout';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { router, WhenVisible } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ApplicationForApprovalProps {
    accounts: PaginatedData & {
        data: CustomerApplication[];
    };
    search?: string;
}

export default function ApplicationForApproval({ accounts, search }: ApplicationForApprovalProps) {
    console.log('Accounts for approval:', accounts);
    const breadcrumbs = [{ title: 'Activation', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const handleSearch = () => {
        router.get('/accounts/status/activations', { search: searchInput });
    };

    const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);

    const [isOpenApprovalDialog, setIsOpenApprovalDialog] = useState(false);
    const [isOpenRejectionDialog, setIsOpenRejectionDialog] = useState(false);
    const [isOpenAccountSummary, setIsOpenAccountSummary] = useState(false);

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

    const handleViewAccount = (id: string | number) => {
        setSelectedAccountId(id);
        setIsOpenAccountSummary(true);
    };

    const handleSelectAccount = (accountId: number | string) => {
        router.get(`/accounts/${accountId}`);
    };

    return (
        <AppLayout title="Accounts" breadcrumbs={breadcrumbs} className="overflow-hidden">
            <ComprehensiveSummaryDialog accountId={selectedAccountId} open={isOpenAccountSummary} onOpenChange={setIsOpenAccountSummary} />
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

            <SectionHeader className="flex justify-center">
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
            </SectionHeader>

            <SectionContent className="overflow-hidden">
                <Table>
                    <TableHeader col={5}>
                        <TableData>Name</TableData>
                        <TableData>Type</TableData>
                        <TableData>Address</TableData>
                        <TableData>Status</TableData>
                        <TableData>Action</TableData>
                    </TableHeader>

                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-18rem)]">
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
                                accounts?.data.map((account: Account) => (
                                    <TableRow
                                        key={account.id}
                                        col={5}
                                        onClick={() => {
                                            handleSelectAccount(account.id);
                                        }}
                                    >
                                        <TableData>{account.account_name}</TableData>
                                        <TableData>{account.application.customer_type.full_text}</TableData>
                                        <TableData>{account.application.full_address}</TableData>
                                        <TableData>{account.account_status}</TableData>
                                        <TableData className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewAccount(account.id);
                                                }}
                                            >
                                                <Eye className="h-3 w-3" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                            <Button
                                                size="sm"
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
                                                size="sm"
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
            </SectionContent>
        </AppLayout>
    );
}
