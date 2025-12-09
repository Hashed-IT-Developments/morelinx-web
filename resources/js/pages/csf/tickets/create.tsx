import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { router, WhenVisible } from '@inertiajs/react';
import { Avatar } from '@radix-ui/react-avatar';
import { ArrowRight, Contact, MapPin, Search } from 'lucide-react';
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

    const breadcrumbs = [{ title: 'Create CSF', href: '#' }];
    return (
        <main>
            <AppLayout title="Create Ticket" breadcrumbs={breadcrumbs} className="overflow-hidden">
                <SectionHeader className="gap-2">
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
                        key={isOpen ? `${type}-${selectedAccount?.id || 'new'}` : 'closed'}
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
                </SectionHeader>

                <SectionContent className="overflow-hidden">
                    <Table>
                        <TableHeader col={5}>
                            <TableData>Account #</TableData>
                            <TableData>Name</TableData>
                            <TableData>Email</TableData>
                            <TableData>Address</TableData>
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
                                {accounts?.data.map((account: Account) => (
                                    <TableRow col={5} key={account.id}>
                                        <TableData className="grid grid-cols-3 sm:hidden">
                                            <div className="col-span-2 flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-purple-600 text-white">
                                                        {account.customer_application?.first_name?.charAt(0)}
                                                        {account.customer_application?.last_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <h1 className="flex max-w-md text-lg leading-tight font-medium break-words text-gray-900">
                                                        {account.customer_application?.identity}
                                                    </h1>

                                                    <span>{account.customer_application?.account_number}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
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
                                            </div>
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={account.account_number}>
                                            {account.account_number}
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={account.account_name}>
                                            {account.account_name}
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={account.email_address}>
                                            {account.email_address}
                                        </TableData>
                                        <TableData className="col-span-2 truncate" tooltip={account.customer_application?.full_address}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex max-w-60 flex-col leading-tight break-words">
                                                    <span>{account.customer_application?.full_address}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="cols-span-2 hidden justify-end sm:flex">
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

                                        <TableData
                                            className="smLblock col-span-2 hidden overflow-visible"
                                            tooltip={account.customer_application?.full_address}
                                        >
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex max-w-full flex-col leading-tight break-words">
                                                    <span>{account.customer_application?.full_address}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <Contact size={12} />
                                                    Contact:
                                                </span>
                                                <div className="flex max-w-full flex-col leading-tight break-words">
                                                    <span>{account.customer_application?.email_address}</span>
                                                    <span>{account.customer_application?.tel_no_1}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                    </TableRow>
                                ))}
                            </WhenVisible>
                        </TableBody>

                        <TableFooter>
                            <Pagination search={searchInput} pagination={accounts} />
                        </TableFooter>
                    </Table>
                </SectionContent>
            </AppLayout>
        </main>
    );
}
