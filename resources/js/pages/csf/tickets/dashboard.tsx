import { router, useForm, WhenVisible } from '@inertiajs/react';
import { AlertTriangle, BadgeAlert, CheckCircle, ChevronDown, ChevronUp, Clock, FileText, ListFilter, Ticket, Users } from 'lucide-react';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import AppLayout from '@/layouts/app-layout';

import { useTicketTypeMethod } from '@/hooks/useTicketTypeMethod';
import { cn, getStatusColor, truncateText } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';

import { CardSkeleton } from '@/components/composables/skeletons/card';
import ChartSkeleton from '@/components/composables/skeletons/chart';
import { TableSkeleton } from '@/components/composables/skeletons/table';

import { Table, TableBody, TableData, TableHeader, TableRow } from '@/components/composables/table';

interface ChartData {
    name: string;
    value: number;
    color?: string;
    [key: string]: string | number | undefined;
}

interface TrendData {
    date: string;
    created: number;
    completed: number;
    pending: number;
}

interface NameCount {
    name: string;
    count: number;
}

interface NameCountData {
    name: string;
    count: number;
    data: Ticket[];
}

interface TooltipPayload {
    payload: ChartData;
    value: number;
    color: string;
    name?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

interface DisplayedCards {
    total_tickets: boolean;
    completed_tickets: boolean;
    pending_tickets: boolean;
    my_tickets: boolean;
    unresolved_tickets: boolean;
    resolved_tickets: boolean;
    efficiency_rate: boolean;
    ticket_status_distribution: boolean;
    priority_distribution: boolean;
    tickets_by_department: boolean;
    tickets_by_severity: boolean;
}

interface FormFilter {
    date_start: Date | undefined;
    date_end: Date | undefined;
    type: string;
    concern: string;
    status: string;
}

interface DashboardProps {
    trendData?: TrendData[];
    priorityData?: ChartData[];
    tickets_count?: number;
    tickets_completed_count?: number;
    tickets_pending_count?: number;
    my_tickets_count?: number;
    tickets_grouped_by_status: NameCount[];
    tickets_grouped_by_department: NameCount[];
    ticket_completion_rate: number;
    tickets_unresolved_count?: number;
    tickets_resolved_count?: number;
    tickets_by_severity?: NameCountData[];
    filter: FormFilter;
    statuses: string[];
}
const StatusTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                    <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Count: <span className="font-bold text-blue-600">{data.value}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    {data.name === 'Completed' && 'Successfully resolved tickets'}
                    {data.name === 'Pending' && 'Awaiting assignment or action'}
                    {data.name === 'Unresolved' && 'Requires immediate attention'}
                    {data.name === 'Assigned' && 'Currently being worked on'}
                </p>
            </div>
        );
    }
    return null;
};

const DepartmentTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Active Tickets: <span className="font-bold text-blue-600">{data.value}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">Department workload and ticket distribution</p>
            </div>
        );
    }
    return null;
};

const PriorityTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <p className="font-semibold text-gray-900 dark:text-white">{label} Priority</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Count:{' '}
                    <span className="font-bold" style={{ color: data.color }}>
                        {data.value}
                    </span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    {label === 'High' && 'Urgent tickets requiring immediate attention'}
                    {label === 'Medium' && 'Standard priority tickets with normal workflow'}
                    {label === 'Low' && 'Non-urgent tickets that can wait'}
                </p>
                <div className="mt-2 border-t pt-2">
                    <p className="text-xs text-gray-400">Priority level distribution analysis</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function TicketDashboard({
    tickets_count,
    tickets_pending_count,
    tickets_completed_count,
    my_tickets_count,
    tickets_grouped_by_status,
    tickets_grouped_by_department,
    ticket_completion_rate,
    tickets_resolved_count,
    tickets_unresolved_count,
    tickets_by_severity,
    filter,
    statuses,
}: DashboardProps) {
    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const breadcrumbs = [{ title: 'Dashboard', href: '' }];

    const defaultDisplayedCards: DisplayedCards = {
        total_tickets: true,
        completed_tickets: true,
        pending_tickets: true,
        my_tickets: true,
        unresolved_tickets: true,
        resolved_tickets: true,
        efficiency_rate: true,
        ticket_status_distribution: true,
        priority_distribution: true,
        tickets_by_department: true,
        tickets_by_severity: true,
    };

    const [displayedCards, setDisplayedCards] = useState<DisplayedCards>(() => {
        const saved = localStorage.getItem('displayedCards');
        if (saved) {
            try {
                return { ...defaultDisplayedCards, ...JSON.parse(saved) };
            } catch {
                return defaultDisplayedCards;
            }
        }
        return defaultDisplayedCards;
    });

    useEffect(() => {
        localStorage.setItem('displayedCards', JSON.stringify(displayedCards));
    }, [displayedCards]);

    const handleChange = (key: keyof DisplayedCards) => {
        setDisplayedCards((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const [isOpenCardList, setIsOpenCardList] = useState(false);

    const formFilter = useForm<FormFilter>({
        date_start: filter.date_start ? new Date(filter.date_start) : undefined,
        date_end: filter.date_end ? new Date(filter.date_end) : undefined,
        type: filter.type ?? '',
        concern: filter.concern ?? '',
        status: filter.status ?? 'All',
    });

    const handleSubmit = () => {
        formFilter.get(route('tickets.dashboard'));
    };

    const handleResetForm = () => {
        router.get(
            route('tickets.dashboard'),
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleVisitTicket = (id: string) => {
        router.visit(
            route('tickets.view', {
                ticket_id: id,
            }),
        );
    };

    const { getTicketTypes } = useTicketTypeMethod();

    const [ticket_types, setTicketTypes] = useState<TicketType[]>([]);
    const [concern_types, setConcernTypes] = useState<TicketType[]>([]);

    useEffect(() => {
        async function fetchTicketTypes() {
            try {
                const [ticketType, concernType] = await Promise.all([
                    getTicketTypes({ type: 'ticket_type' }),
                    getTicketTypes({ type: 'concern_type' }),
                ]);

                setTicketTypes(ticketType.data);
                setConcernTypes(concernType.data);
            } catch (err) {
                console.error('Failed:', err);
            }
        }

        fetchTicketTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    return (
        <AppLayout title="CSF Dashboard" breadcrumbs={breadcrumbs}>
            <header className="flex justify-end p-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" tooltip="Filter">
                            <ListFilter />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent sideOffset={10} align="end">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            className="flex flex-col gap-2"
                        >
                            <Input
                                type="date"
                                label="Date Start"
                                value={formFilter.data.date_start}
                                onDateChange={(value) => formFilter.setData('date_start', value)}
                            />
                            <Input
                                type="date"
                                label="Date End"
                                value={formFilter.data.date_end}
                                onDateChange={(value) => formFilter.setData('date_end', value)}
                            />

                            <Separator />
                            <div className="flex items-center justify-between">
                                <h1 className="text-sm">View / Hide Cards</h1>

                                <Button
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsOpenCardList(!isOpenCardList);
                                    }}
                                >
                                    <ChevronDown className={cn(isOpenCardList && 'hidden')} />
                                    <ChevronUp className={cn(!isOpenCardList && 'hidden')} />
                                </Button>
                            </div>
                            {isOpenCardList && (
                                <section className="flex flex-col gap-2">
                                    {Object.entries(displayedCards).map(([key, value]) => (
                                        <Input
                                            key={key}
                                            type="checkbox"
                                            checked={value}
                                            onChange={() => handleChange(key as keyof DisplayedCards)}
                                            label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        />
                                    ))}
                                </section>
                            )}
                            <Separator />

                            <footer className="flex items-center justify-end gap-2">
                                {(filter.date_start || filter.date_end) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        type="button"
                                        onClick={() => {
                                            handleResetForm();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button size="sm" mode="success">
                                    Submit
                                </Button>
                            </footer>
                        </form>
                    </PopoverContent>
                </Popover>
            </header>
            <div className="mt-4 space-y-6 px-4 pb-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {displayedCards.total_tickets && (
                        <WhenVisible data="tickets_count" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{tickets_count}</div>
                                    <p className="text-xs text-muted-foreground">All time tickets</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}

                    {displayedCards.completed_tickets && (
                        <WhenVisible data="tickets_completed_count,ticket_completion_rate" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{tickets_completed_count}</div>
                                    <p className="text-xs text-muted-foreground">{ticket_completion_rate}% completion rate</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}

                    {displayedCards.pending_tickets && (
                        <WhenVisible data="tickets_pending_count" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{tickets_pending_count}</div>
                                    <p className="text-xs text-muted-foreground">Awaiting action</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}

                    {displayedCards.my_tickets && (
                        <WhenVisible data="my_tickets_count" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
                                    <Users className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{my_tickets_count}</div>
                                    <p className="text-xs text-muted-foreground">Assigned to me</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}
                    {displayedCards.unresolved_tickets && (
                        <WhenVisible data="tickets_unresolved_count" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">Unresolved</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-red-600">{tickets_unresolved_count}</div>
                                    <p className="text-sm text-muted-foreground">Requires immediate attention</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}
                    {displayedCards.resolved_tickets && (
                        <WhenVisible data="tickets_resolved_count" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">Resolved</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-blue-600">{tickets_resolved_count}</div>
                                    <p className="text-sm text-muted-foreground">Resolved tickets</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}

                    {displayedCards.efficiency_rate && (
                        <WhenVisible data="ticket_completion_rate" fallback={<CardSkeleton />}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">Efficiency Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="mb-2 text-4xl font-bold text-green-600">{ticket_completion_rate}%</div>
                                    <p className="text-sm text-muted-foreground">Tickets completed successfully</p>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    )}

                    {displayedCards.ticket_status_distribution && (
                        <div className="col-span-2">
                            <WhenVisible data="tickets_grouped_by_status" fallback={<ChartSkeleton type="bar" />}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Ticket Status Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={tickets_grouped_by_status?.map((item, index) => ({
                                                    name: item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('_', ' '),
                                                    value: item.count,
                                                    color: COLORS[index % COLORS.length],
                                                }))}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    interval={0}
                                                    tick={({ x, y, payload }) => (
                                                        <text x={x} y={y + 10} fontSize={10} textAnchor="middle">
                                                            <title>{payload.value}</title>
                                                            {truncateText(payload.value, 8)}
                                                        </text>
                                                    )}
                                                />

                                                <YAxis />
                                                <Tooltip content={<StatusTooltip />} />
                                                <Bar dataKey="value">
                                                    {tickets_grouped_by_status?.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </WhenVisible>
                        </div>
                    )}

                    {displayedCards.priority_distribution && (
                        <div className="col-span-2">
                            <WhenVisible data="tickets_by_severity" fallback={<ChartSkeleton type="area" />}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BadgeAlert className="h-5 w-5" />
                                            Priority Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart
                                                data={tickets_by_severity?.map((item, index) => ({
                                                    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                                                    value: item.count,
                                                    color: COLORS[index % COLORS.length],
                                                }))}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    interval={0}
                                                    tick={({ x, y, payload }) => (
                                                        <text x={x} y={y + 10} fontSize={12} textAnchor="middle">
                                                            <title>{payload.value}</title>
                                                            {truncateText(payload.value, 8)}
                                                        </text>
                                                    )}
                                                />
                                                <YAxis />
                                                <Tooltip content={<PriorityTooltip />} />
                                                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </WhenVisible>
                        </div>
                    )}

                    {displayedCards.tickets_by_severity && (
                        <div className="col-span-4">
                            <WhenVisible data="tickets_by_severity" fallback={<TableSkeleton />}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Ticket className="h-5 w-5" />
                                            Tickets by Severity
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <Tabs defaultValue={'low'} className="w-full">
                                            <header className="flex items-center justify-between gap-2">
                                                <TabsList>
                                                    {tickets_by_severity?.map((severity) => (
                                                        <TabsTrigger key={severity.name} value={severity.name}>
                                                            {severity.name.toUpperCase()} ({severity.count})
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button type="button" variant="outline">
                                                            <ListFilter />
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent className="flex flex-col gap-2">
                                                        <Select
                                                            id="types"
                                                            onValueChange={(value) => {
                                                                formFilter.setData('type', value);
                                                            }}
                                                            value={formFilter.data.type}
                                                            label="Type"
                                                            searchable={true}
                                                            options={ticketTypeOptions}
                                                            error={formFilter.errors.type}
                                                        />

                                                        <Select
                                                            id="concern"
                                                            onValueChange={(value) => {
                                                                formFilter.setData('concern', value);
                                                            }}
                                                            value={formFilter.data.concern}
                                                            label="Concern"
                                                            searchable={true}
                                                            options={concernTypeOptions}
                                                            error={formFilter.errors.concern}
                                                        />

                                                        <Select
                                                            label="Status"
                                                            options={statusOptions}
                                                            onValueChange={(value) => {
                                                                formFilter.setData('status', value);
                                                            }}
                                                            value={formFilter.data.status}
                                                        />

                                                        <div className="flex justify-end gap-2">
                                                            {(formFilter.data.type || formFilter.data.status || formFilter.data.concern) && (
                                                                <Button
                                                                    tooltip="Clear"
                                                                    mode="danger"
                                                                    onClick={() => {
                                                                        handleResetForm();
                                                                    }}
                                                                >
                                                                    Clear
                                                                </Button>
                                                            )}

                                                            <Button
                                                                tooltip="Submit Filter"
                                                                mode="success"
                                                                onClick={() => {
                                                                    handleSubmit();
                                                                }}
                                                            >
                                                                Filter
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </header>

                                            {tickets_by_severity?.map((severity) => (
                                                <TabsContent key={severity.name} value={severity.name}>
                                                    <Table>
                                                        <TableHeader col={3}>
                                                            <TableData>Name</TableData>
                                                            <TableData>Created At</TableData>
                                                            <TableData>Status</TableData>
                                                        </TableHeader>

                                                        <TableBody>
                                                            {severity?.data.length > 0 ? (
                                                                severity?.data.map((ticket: Ticket) => (
                                                                    <TableRow
                                                                        col={3}
                                                                        key={ticket.id}
                                                                        onClick={() => {
                                                                            handleVisitTicket(ticket.id);
                                                                        }}
                                                                    >
                                                                        <TableData>{ticket.ticket_no}</TableData>
                                                                        <TableData>
                                                                            {moment(ticket.created_at).format('MMM d, YYYY | H:s A')}
                                                                        </TableData>
                                                                        <TableData>
                                                                            <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                                                        </TableData>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow col={1}>
                                                                    <TableData className="col-span-3 flex items-center justify-center">
                                                                        No tickets for this severity
                                                                    </TableData>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </WhenVisible>
                        </div>
                    )}

                    {displayedCards.tickets_by_department && (
                        <div className="col-span-4">
                            <WhenVisible data="tickets_grouped_by_department" fallback={<ChartSkeleton type="bar" />}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Tickets by Department
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={tickets_grouped_by_department}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    interval={0}
                                                    tick={({ x, y, payload }) => (
                                                        <text x={x} y={y + 10} fontSize={12} textAnchor="middle">
                                                            <title>{payload.value}</title>
                                                            {truncateText(payload.value, 8)}
                                                        </text>
                                                    )}
                                                />
                                                <YAxis />
                                                <Tooltip content={<DepartmentTooltip />} />
                                                <Bar dataKey="count" fill="#3B82F6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </WhenVisible>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
