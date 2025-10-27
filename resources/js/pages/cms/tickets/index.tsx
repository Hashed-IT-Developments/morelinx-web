import AppLayout from '@/layouts/app-layout';

import { cn, formatSplitWords, getStatusColor, useDebounce } from '@/lib/utils';
import { Head, router, WhenVisible } from '@inertiajs/react';

import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { Contact, File, MapPin, Search } from 'lucide-react';

import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface TicketProps {
    tickets: PaginatedData & { data: Ticket[] };
    search?: string | null;
}

export default function Tickets({ tickets, search = null }: TicketProps) {
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get('/tickets', { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get('/tickets', { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSelectTicket = (ticketId: string) => {
        router.visit('/tickets/' + ticketId);
    };

    const breadcrumbs = [{ title: 'Tickets', href: '/tickets' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets" />
            <div className="flex justify-center p-4">
                <div className="w-full max-w-4xl gap-3">
                    <Input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        icon={<Search size={16} />}
                        className="rounded-3xl"
                        placeholder="Search tickets"
                    />
                </div>
            </div>

            <section className="px-4">
                <Table>
                    <TableHeader col={6}>
                        <TableData>Ticket #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Email</TableData>
                        <TableData>Type</TableData>
                        <TableData>Status</TableData>
                    </TableHeader>
                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-17rem)]">
                        <WhenVisible
                            data="tickets"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {!tickets?.data.length ? (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">No tickets found.</span>
                                </div>
                            ) : (
                                tickets?.data?.map((ticket: Ticket) => (
                                    <TableRow key={ticket.id} col={6} className="grid-cols-3" onClick={() => handleSelectTicket(ticket.id)}>
                                        <TableData className="col-span-2 sm:hidden">
                                            <section className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-purple-600 text-white">
                                                            {ticket.cust_information?.consumer_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <h1 className="flex max-w-md text-lg leading-tight font-medium break-words text-gray-900">
                                                            {ticket.cust_information?.consumer_name}
                                                        </h1>
                                                        <span>
                                                            <TableData className="col-span-2">{ticket.ticket_no}</TableData>
                                                        </span>
                                                    </div>
                                                </div>
                                                <TableData>
                                                    <Badge
                                                        className={cn(
                                                            'font-medium1 text-sm',
                                                            ticket.status
                                                                ? getStatusColor(ticket.status)
                                                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                        )}
                                                    >
                                                        {formatSplitWords(ticket.status)}
                                                    </Badge>
                                                </TableData>
                                            </section>
                                        </TableData>
                                        <TableData className="hidden truncate sm:block">{ticket.ticket_no}</TableData>
                                        <TableData className="hidden truncate sm:block">{ticket.cust_information?.consumer_name}</TableData>
                                        <TableData>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex flex-col truncate">
                                                    <span>
                                                        {ticket.cust_information?.sitio}, {ticket.cust_information?.landmark}
                                                    </span>
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
                                                    <span className="truncate">{ticket.cust_information?.phone}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 truncate">
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <File size={12} />
                                                    Type:
                                                </span>
                                                <span className="truncate">{ticket.details?.reason}</span>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 hidden truncate sm:block">
                                            <Badge
                                                className={cn(
                                                    'font-medium1 text-sm',
                                                    ticket.status
                                                        ? getStatusColor(ticket.status)
                                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                )}
                                            >
                                                {formatSplitWords(ticket.status)}
                                            </Badge>
                                        </TableData>
                                    </TableRow>
                                ))
                            )}
                        </WhenVisible>
                    </TableBody>
                    <TableFooter>
                        <Pagination search={debouncedSearch} pagination={tickets} />
                    </TableFooter>
                </Table>
            </section>
        </AppLayout>
    );
}
