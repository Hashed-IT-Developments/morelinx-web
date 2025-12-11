import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';

import Button from '@/components/composables/button';
import Pagination from '@/components/composables/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/status-utils';
import { cn, formatSplitWords } from '@/lib/utils';
import { WhenVisible } from '@inertiajs/react';
import { Contact, File, Forward, MapPin } from 'lucide-react';

interface MyTicketTabProps {
    tickets: PaginatedData & { data: Ticket[] };
    status?: string;
    setSelectedTicket: (ticket: Ticket | null) => void;
    handleSelectTicket: (ticketId: number) => void;
    setIsOpenAssignTicketDepartment: (open: boolean) => void;
    setIsOpenAssignTicketUser: (open: boolean) => void;
    setIsOpenUpdateTicket: (open: boolean) => void;
}
export default function MyTicketTab({
    tickets,
    status,
    setSelectedTicket,
    handleSelectTicket,
    setIsOpenAssignTicketDepartment,
    setIsOpenAssignTicketUser,
    setIsOpenUpdateTicket,
}: MyTicketTabProps) {
    return (
        <main>
            <Table>
                <TableHeader col={7}>
                    <TableData>Submission Type</TableData>
                    <TableData>Name</TableData>
                    <TableData>Address</TableData>
                    <TableData>Contact</TableData>
                    <TableData>Type</TableData>
                    <TableData>Severity</TableData>

                    {status !== 'completed' && (
                        <>
                            <TableData>Forwarding</TableData>
                            <TableData>Actions</TableData>
                        </>
                    )}
                </TableHeader>
                <TableBody className="h-[calc(100vh-18rem)] sm:h-[calc(100vh-18.5rem)]">
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
                                <TableRow
                                    key={ticket.id}
                                    col={7}
                                    className="grid-cols-3"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectTicket(Number(ticket.id));
                                    }}
                                >
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
                                                            ? getStatusColor(ticket.severity)
                                                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                    )}
                                                >
                                                    {formatSplitWords(ticket.status)}
                                                </Badge>
                                            </TableData>
                                        </section>
                                    </TableData>

                                    <TableData className="hidden sm:table-cell">{ticket.submission_type}</TableData>

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
                                            <span className="truncate">{ticket.details?.concern_type?.name}</span>
                                        </div>
                                    </TableData>
                                    <TableData className="col-span-2 hidden truncate sm:block">
                                        <Badge
                                            className={cn(
                                                'font-medium1 text-sm',
                                                ticket.severity
                                                    ? getStatusColor(ticket.severity)
                                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                            )}
                                        >
                                            {formatSplitWords(ticket.severity)}
                                        </Badge>
                                    </TableData>

                                    {status !== 'completed' && (
                                        <>
                                            <TableData className="flex flex-col gap-2">
                                                <Button
                                                    variant="default"
                                                    mode="warning"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setSelectedTicket(ticket);
                                                        setIsOpenAssignTicketDepartment(true);
                                                    }}
                                                >
                                                    Dept. <Forward />
                                                </Button>

                                                <Button
                                                    variant="default"
                                                    mode="danger"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setSelectedTicket(ticket);
                                                        setIsOpenAssignTicketUser(true);
                                                    }}
                                                >
                                                    User <Forward />
                                                </Button>
                                            </TableData>

                                            <TableData className="">
                                                <Button
                                                    mode="info"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTicket(ticket);
                                                        setIsOpenUpdateTicket(true);
                                                    }}
                                                >
                                                    Update
                                                </Button>
                                            </TableData>
                                        </>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </WhenVisible>
                </TableBody>
                <TableFooter>
                    <Pagination pagination={tickets} />
                </TableFooter>
            </Table>
        </main>
    );
}
