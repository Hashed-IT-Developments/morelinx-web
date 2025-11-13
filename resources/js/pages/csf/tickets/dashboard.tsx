import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Users } from 'lucide-react';
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
    tickets_not_executed_count?: number;
    tickets_executed_count?: number;
    tickets_by_severity?: NameCount[];
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
                    {data.name === 'Not Executed' && 'Requires immediate attention'}
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

const TrendTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                </div>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}:</span>
                            </div>
                            <span className="font-bold" style={{ color: entry.color }}>
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
                <p className="mt-2 border-t pt-2 text-xs text-gray-500">Daily ticket activity trends</p>
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
    trendData,
    priorityData,
    tickets_count,
    tickets_pending_count,
    tickets_completed_count,
    my_tickets_count,
    tickets_grouped_by_status,
    tickets_grouped_by_department,
    ticket_completion_rate,
    tickets_executed_count,
    tickets_not_executed_count,
    tickets_by_severity,
}: DashboardProps) {
    const weeklyTrendData: TrendData[] = trendData || [
        { date: 'Mon', created: 12, completed: 8, pending: 4 },
        { date: 'Tue', created: 15, completed: 10, pending: 5 },
        { date: 'Wed', created: 18, completed: 14, pending: 4 },
        { date: 'Thu', created: 10, completed: 12, pending: 2 },
        { date: 'Fri', created: 20, completed: 16, pending: 4 },
        { date: 'Sat', created: 8, completed: 6, pending: 2 },
        { date: 'Sun', created: 5, completed: 4, pending: 1 },
    ];

    const priorityChartData: ChartData[] = priorityData || [
        { name: 'High', value: 25, color: '#EF4444' },
        { name: 'Medium', value: 67, color: '#F59E0B' },
        { name: 'Low', value: 64, color: '#10B981' },
    ];

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const breadcrumbs = [
        { title: 'CSF', href: '/csf/tickets' },
        { title: 'Dashboard', href: '/csf/tickets/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets Dashboard" />

            <div className="mt-4 space-y-6 px-4 pb-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Not Executed</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-2 text-4xl font-bold text-red-600">{tickets_not_executed_count}</div>
                            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Executed</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-2 text-4xl font-bold text-blue-600">{tickets_executed_count}</div>
                            <p className="text-sm text-muted-foreground">Executed tickets</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Efficiency Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-2 text-4xl font-bold text-green-600">{ticket_completion_rate}%</div>
                            <p className="text-sm text-muted-foreground">Tickets completed successfully</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
