import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { WhenVisible } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import AddTicket from './components/add-ticket';

type Account = {
    id: number;
    name: string;
    email: string;
};

interface TicketCreateProps {
    accounts: PaginatedData & { data?: Account[] };
    ticket_types: TicketType[];
    concern_types: TicketType[];
    roles: Role[];
}

export default function TicketCreate({ accounts, ticket_types, concern_types, roles }: TicketCreateProps) {
    const [type, setType] = useState<string>('walk-in');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const [isOpen, setIsOpen] = useState(false);

    const handleOpenAddTicket = (id: number) => {
        setType('account');
        setSelectedAccountId(id.toString());
        setIsOpen(true);
    };

    const breadcrumbs = [{ title: 'Create Ticket', href: '/tickets/create' }];
    return (
        <main>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-between gap-2 p-4">
                    <span className="hidden sm:block"></span>
                    <div className="w-full max-w-2xl">
                        <Input value={''} onChange={() => {}} icon={<Search size={16} />} className="rounded-3xl" placeholder="Search Accounts" />
                    </div>

                    <AddTicket
                        onClick={() => {
                            setType('walk-in');
                            setSelectedAccountId('');
                            setIsOpen(true);
                        }}
                        ticket_types={ticket_types}
                        concern_types={concern_types}
                        isOpen={isOpen}
                        setOpen={setIsOpen}
                        roles={roles}
                        type={type}
                        selectedAccountId={selectedAccountId}
                    />
                </div>

                <section className="px-4">
                    <Table>
                        <TableHeader col={3}>
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
                                    <TableRow col={3} key={account.id}>
                                        <TableData>{account.name}</TableData>
                                        <TableData>{account.email}</TableData>
                                        <TableData>--</TableData>
                                        <TableData className="flex w-full justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    handleOpenAddTicket(account.id);
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
                            <Pagination pagination={accounts} />
                        </TableFooter>
                    </Table>
                </section>
            </AppLayout>
        </main>
    );
}
