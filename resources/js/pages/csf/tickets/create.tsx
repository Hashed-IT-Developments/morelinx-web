import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { router, WhenVisible } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AddTicket from './components/add-ticket';

interface TicketCreateProps {
    accounts: PaginatedData & { data?: Account[] };
    ticket_types: TicketType[];
    concern_types: TicketType[];
    roles: Role[];
    search: string;
}

export default function TicketCreate({ accounts, search, ticket_types, concern_types, roles }: TicketCreateProps) {
    console.log(accounts);
    const [type, setType] = useState<string>('walk-in');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [searchInput, setSearch] = useState(search ?? '');

    const debouncedSearch = useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get('/tickets/create', params, {
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

    const [isOpen, setIsOpen] = useState(false);

    const handleOpenAddTicket = (account: Account) => {
        setType('account');
        setSelectedAccount(account);
        setIsOpen(true);
    };

    const breadcrumbs = [{ title: 'Create Ticket', href: '/tickets/create' }];
    return (
        <main>
            <AppLayout title="Create Ticket" breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-between gap-2 p-4">
                    <span className="hidden sm:block"></span>
                    <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-2xl items-center gap-2">
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search size={16} />}
                            className="rounded-3xl"
                            placeholder="Search Accounts"
                        />
                    </form>

                    <AddTicket
                        onClick={() => {
                            setType('walk-in');
                            setSelectedAccount(null);
                            setIsOpen(true);
                        }}
                        ticket_types={ticket_types}
                        concern_types={concern_types}
                        isOpen={isOpen}
                        setOpen={setIsOpen}
                        roles={roles}
                        type={type}
                        account={selectedAccount}
                    />
                </div>

                <section className="px-4">
                    <Table>
                        <TableHeader col={5}>
                            <TableData>Account #</TableData>
                            <TableData>Name</TableData>
                            <TableData>Email</TableData>
                            <TableData>Address</TableData>
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
                                {accounts?.data.map((account: Account) => (
                                    <TableRow col={5} key={account.id}>
                                        <TableData className="truncate" tooltip={account.account_number}>
                                            {account.account_number}
                                        </TableData>
                                        <TableData className="truncate" tooltip={account.account_name}>
                                            {account.account_name}
                                        </TableData>
                                        <TableData className="truncate" tooltip={account.email_address}>
                                            {account.email_address}
                                        </TableData>
                                        <TableData className="col-span-2 truncate" tooltip={account.application.full_address}>
                                            {account.application.full_address}
                                        </TableData>
                                        <TableData className="col-span-2 mx-2 justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    handleOpenAddTicket(account);
                                                }}
                                                shape="rounded"
                                                size="sm"
                                            >
                                                Create Ticket <ArrowRight />
                                            </Button>
                                        </TableData>
                                    </TableRow>
                                ))}
                            </WhenVisible>
                        </TableBody>

                        <TableFooter>
                            <Pagination search={searchInput} pagination={accounts} />
                        </TableFooter>
                    </Table>
                </section>
            </AppLayout>
        </main>
    );
}
