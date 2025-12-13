import AppLayout from '@/layouts/app-layout';

import { cn, formatSplitWords, getStatusColor } from '@/lib/utils';
import { router, useForm, WhenVisible } from '@inertiajs/react';

import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import Select from '@/components/composables/select';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTicketTypeMethod } from '@/hooks/useTicketTypeMethod';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { Contact, File, ListFilter, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type TicketFilter = {
    from?: Date | undefined;
    to?: Date | undefined;
    district?: string;
    barangay?: string;
    status?: string;
    department?: string;
    channel?: string;
    type?: string;
    concern?: string;
    actual_finding?: string;
};

interface TicketProps {
    tickets: PaginatedData & { data: Ticket[] };
    search?: string | null;
    filters: TicketFilter;
    statuses: string[];
    roles: Role[];
}

export default function Tickets({ tickets, search = null, filters, statuses, roles }: TicketProps) {
    const [searchInput, setSearch] = useState(search ?? '');

    const [hasFilter, setHasFilter] = useState(false);

    const filterForm = useForm<TicketFilter>({
        from: undefined,
        to: undefined,
        department: '',
        channel: '',
        type: '',
        concern: '',
        status: '',
        actual_finding: '',
    });

    useEffect(() => {
        const hasFilter = Object.values(filterForm.data).some((value) => {
            if (value instanceof Date) {
                return true;
            }
            return value !== undefined && value !== '';
        });

        setHasFilter(hasFilter);
    }, [filterForm.data]);

    useEffect(() => {
        if (filters) {
            filterForm.setData({
                from: filters.from ?? undefined,
                to: filters.to ?? undefined,
                department: filters.department ?? '',
                channel: filters.channel ?? '',
                type: filters.type ?? '',
                concern: filters.concern ?? '',
                status: filters.status ?? '',
                actual_finding: filters.actual_finding ?? '',
            });

            const hasActualFilters = Object.values(filters).some((value) => {
                if (value instanceof Date) return true;
                if (value === undefined || value === null || value === '') return false;
                return true;
            });

            setIsOpenFilter(hasActualFilters);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const debouncedSearch = useCallback((searchTerm: string) => {
        const query: TicketFilter & { search?: string } = {
            ...filterForm.data,
            search: searchTerm,
        };

        router.get('/tickets', query, {
            preserveState: true,
            preserveScroll: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchInput === (search ?? '')) return;

        const timeoutId = setTimeout(() => {
            debouncedSearch(searchInput);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchInput, debouncedSearch, search]);

    const handleSelectTicket = (ticketId: string) => {
        router.visit('/tickets/view?ticket_id=' + ticketId);
    };

    const { getTicketTypes } = useTicketTypeMethod();

    const [ticket_types, setTicketTypes] = useState<TicketType[]>([]);
    const [concern_types, setConcernTypes] = useState<TicketType[]>([]);
    const [channels, setChannels] = useState<TicketType[]>([]);
    const [actual_findings, setActualFindings] = useState<TicketType[]>([]);

    useEffect(() => {
        async function fetchTicketTypes() {
            try {
                const [ticketType, concernType, channel, actual_finding] = await Promise.all([
                    getTicketTypes({ type: 'ticket_type' }),
                    getTicketTypes({ type: 'concern_type' }),
                    getTicketTypes({ type: 'channel' }),
                    getTicketTypes({ type: 'actual_findings_type' }),
                ]);

                setTicketTypes(ticketType.data);
                setConcernTypes(concernType.data);
                setChannels(channel.data);
                setActualFindings(actual_finding.data);
            } catch (err) {
                console.error('Failed:', err);
            }
        }

        fetchTicketTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const breadcrumbs = [{ title: 'Tickets', href: '/tickets' }];
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const ticketTypeOptions = useMemo(
        () =>
            ticket_types?.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            })) || [],
        [ticket_types],
    );

    const concernTypeOptions = useMemo(
        () =>
            concern_types?.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            })) || [],
        [concern_types],
    );

    const roleOptions = useMemo(
        () =>
            roles?.map((role) => ({
                label: role.name,
                value: role.id.toString(),
            })) || [],
        [roles],
    );

    const statusOptions = useMemo(
        () => [
            { label: 'All', value: 'All' },
            ...statuses.map((status) => ({
                label: status,
                value: status,
            })),
        ],
        [statuses],
    );

    const channelOptions = useMemo(
        () =>
            channels?.map((channel) => ({
                label: channel.name,
                value: channel.id.toString(),
            })) || [],
        [channels],
    );

    const actualFindingsOptions = useMemo(
        () =>
            actual_findings?.map((actual_finding) => ({
                label: actual_finding.name,
                value: actual_finding.id.toString(),
            })) || [],
        [actual_findings],
    );

    const submitFilter = () => {
        const query: Record<string, string> = {};

        Object.entries(filterForm.data).forEach(([key, value]) => {
            if (value) {
                query[key] = value instanceof Date ? value.toISOString() : String(value);
            }
        });

        if (searchInput) query.search = searchInput;

        router.get('/tickets', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        filterForm.data.from = undefined;
        filterForm.data.to = undefined;
        filterForm.data.department = '';
        filterForm.data.channel = '';
        filterForm.data.type = '';
        filterForm.data.concern = '';
        filterForm.data.status = '';
        filterForm.data.actual_finding = '';
        submitFilter();
    };

    return (
        <AppLayout title="Tickets" breadcrumbs={breadcrumbs} className="overflow-hidden">
            <SectionHeader className="relative flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearch(e.target.value.toString())}
                        icon={<Search size={16} />}
                        placeholder="Search accounts"
                        className="w-full max-w-80 rounded-3xl sm:max-w-90"
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                tooltip={isOpenFilter ? 'Close Filters' : 'Show Filters'}
                                variant="ghost"
                                onClick={() => {
                                    setIsOpenFilter(!isOpenFilter);
                                }}
                            >
                                <ListFilter />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2">
                            <Input label="From" type="date" onDateChange={(date) => filterForm.setData('from', date)} value={filterForm.data.from} />
                            <Input label="To" type="date" onDateChange={(date) => filterForm.setData('to', date)} value={filterForm.data.to} />

                            <Select
                                id="department"
                                onValueChange={(value) => {
                                    filterForm.setData('department', value);
                                }}
                                value={filterForm.data.barangay}
                                label="Department"
                                searchable={true}
                                options={roleOptions}
                                error={filterForm.errors.barangay}
                            />
                            <Select
                                id="channel"
                                onValueChange={(value) => {
                                    filterForm.setData('channel', value);
                                }}
                                value={filterForm.data.channel}
                                label="Channel"
                                searchable={true}
                                options={channelOptions}
                                error={filterForm.errors.channel}
                            />
                            <Select
                                id="types"
                                onValueChange={(value) => {
                                    filterForm.setData('type', value);
                                }}
                                value={filterForm.data.barangay}
                                label="Type"
                                searchable={true}
                                options={ticketTypeOptions}
                                error={filterForm.errors.type}
                            />

                            <Select
                                id="concern"
                                onValueChange={(value) => {
                                    filterForm.setData('concern', value);
                                }}
                                value={filterForm.data.barangay}
                                label="Concern"
                                searchable={true}
                                options={concernTypeOptions}
                                error={filterForm.errors.concern}
                            />

                            <Select
                                id="actual_finding"
                                onValueChange={(value) => {
                                    filterForm.setData('actual_finding', value);
                                }}
                                value={filterForm.data.actual_finding}
                                label="Actual Finding"
                                searchable={true}
                                options={actualFindingsOptions}
                                error={filterForm.errors.actual_finding}
                            />

                            <Select
                                label="Status"
                                options={statusOptions}
                                onValueChange={(value) => {
                                    filterForm.setData('status', value);
                                }}
                                value={filterForm.data.status}
                            />

                            <div className="flex justify-end gap-2">
                                {hasFilter && (
                                    <Button
                                        tooltip="Clear"
                                        mode="danger"
                                        onClick={() => {
                                            handleReset();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}

                                <Button
                                    tooltip="Submit Filter"
                                    mode="success"
                                    onClick={() => {
                                        submitFilter();
                                    }}
                                >
                                    Filter
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </SectionHeader>

            <SectionContent className="overflow-hidden">
                <Table>
                    <TableHeader col={6}>
                        <TableData>Ticket #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Phone</TableData>
                        <TableData>Type</TableData>
                        <TableData>Status</TableData>
                    </TableHeader>
                    <TableBody className={cn('h-[calc(100vh-15rem)] sm:h-[calc(100vh-19.5rem)]')}>
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
                                                        <AvatarFallback className="bg-linear-to-br from-green-500 to-purple-600 text-white">
                                                            {ticket.cust_information?.consumer_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <h1 className="flex max-w-md text-lg leading-tight font-medium wrap-break-word text-gray-900">
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
                                        <TableData
                                            className="col-span-2 truncate"
                                            tooltip={ticket.cust_information?.town?.name + ', ' + ticket.cust_information?.barangay?.name}
                                        >
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex flex-col truncate wrap-break-word">
                                                    <span>
                                                        {ticket.cust_information?.town?.name}, {ticket.cust_information?.barangay?.name}
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
                                                <span className="truncate">{ticket.details?.ticket_type?.name}</span>
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
                        <Pagination search={searchInput} filters={filterForm.data} pagination={tickets} />
                    </TableFooter>
                </Table>
            </SectionContent>
        </AppLayout>
    );
}
