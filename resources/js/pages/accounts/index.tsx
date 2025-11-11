import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { useDebounce } from '@/lib/utils';
import { router, WhenVisible } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AccountsIndexProps {
    accounts: PaginatedData & {
        data: Account[];
    };
    search?: string;
}

export default function AccountsIndex({ accounts, search }: AccountsIndexProps) {
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

    const handleSelectAccount = (id: string | number) => {
        router.get(`/accounts/${id}`);
    };

    return (
        <AppLayout title="Accounts" breadcrumbs={breadcrumbs}>
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
                                accounts?.data.map((account: Account) => (
                                    <TableRow
                                        key={account.id}
                                        col={5}
                                        onClick={() => {
                                            handleSelectAccount(account.id);
                                        }}
                                    >
                                        <TableData>
                                            {account.application.first_name} {account.application.last_name}
                                        </TableData>
                                        <TableData>{account.application.customer_type.full_text}</TableData>
                                        <TableData>{account.application.full_address}</TableData>
                                        <TableData>{account.account_status}</TableData>
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
