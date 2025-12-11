import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, FileText, ListFilter, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
}

interface FormFilter {
    date_start: Date | undefined;
    date_end: Date | undefined;
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
    tickets_by_severity?: NameCount[];
    filter: FormFilter;
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
}: DashboardProps) {
    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const breadcrumbs = [{ title: 'Dashboard', href: '' }];

    const defaultDisplayedCards: DisplayedCards = {
        total_tickets: false,
        completed_tickets: false,
        pending_tickets: false,
        my_tickets: false,
        unresolved_tickets: false,
        resolved_tickets: false,
        efficiency_rate: false,
        ticket_status_distribution: false,
        priority_distribution: false,
        tickets_by_department: false,
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
    });

    const handleSubmit = () => {
        formFilter.get(route('tickets.dashboard'));
    };

    const handleResetForm = () => {
        router.get(route('tickets.dashboard'));
    };

    return (
        <AppLayout title="CSF Dashboard" breadcrumbs={breadcrumbs}>
            <header className="flex justify-end p-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" tooltip="Filter">
                            <ListFilter />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
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

                            <footer className="flex items-center justify-end gap-2">
                                {(filter.date_start || filter.date_end) && (
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => {
                                            handleResetForm();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button>Submit</Button>
                            </footer>
                        </form>
                    </PopoverContent>
                </Popover>
            </header>
            <div className="mt-4 space-y-6 px-4 pb-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {displayedCards.total_tickets && (
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
                    )}

                    {displayedCards.completed_tickets && (
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
                    )}

                    {displayedCards.pending_tickets && (
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
                    )}

                    {displayedCards.my_tickets && (
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
                    )}
                    {displayedCards.unresolved_tickets && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Unresolved</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-4xl font-bold text-red-600">{tickets_unresolved_count}</div>
                                <p className="text-sm text-muted-foreground">Requires immediate attention</p>
                            </CardContent>
                        </Card>
                    )}
                    {displayedCards.resolved_tickets && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Resolved</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-4xl font-bold text-blue-600">{tickets_resolved_count}</div>
                                <p className="text-sm text-muted-foreground">Resolved tickets</p>
                            </CardContent>
                        </Card>
                    )}

                    {displayedCards.efficiency_rate && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Efficiency Rate</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-4xl font-bold text-green-600">{ticket_completion_rate}%</div>
                                <p className="text-sm text-muted-foreground">Tickets completed successfully</p>
                            </CardContent>
                        </Card>
                    )}

                    {displayedCards.ticket_status_distribution && (
                        <div className="col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Ticket Status Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={tickets_grouped_by_status?.map((item, index) => ({
                                                    name: item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('_', ' '),
                                                    value: item.count,
                                                    color: COLORS[index % COLORS.length],
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {tickets_grouped_by_status
                                                    ?.map((item, index) => ({
                                                        name: item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('_', ' '),
                                                        value: item.count,
                                                        color: COLORS[index % COLORS.length],
                                                    }))
                                                    .map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                            </Pie>
                                            <Tooltip content={<StatusTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {displayedCards.priority_distribution && (
                        <div className="col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
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
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip content={<PriorityTooltip />} />
                                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {displayedCards.tickets_by_department && (
                        <div className="col-span-4">
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
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip content={<DepartmentTooltip />} />
                                            <Bar dataKey="count" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
