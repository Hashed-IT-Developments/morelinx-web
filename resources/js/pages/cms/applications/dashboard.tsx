import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, WhenVisible } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TicketStats {
    totalTickets: number;
    completedTickets: number;
    notExecutedTickets: number;
    myTicketsCount: number;
    pendingTickets: number;
    assignedTickets: number;
}

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

type ApplicationsByStatus = {
    status: string;
    status_label: string;
    total: number;
};

type PendingApplicationsByRateClass = {
    rate_class: string;
    rate_class_label: string;
    total: number;
};

interface DashboardProps {
    ticketStats?: TicketStats;
    statusData?: ChartData[];
    departmentData?: ChartData[];
    trendData?: TrendData[];
    priorityData?: ChartData[];
    total_applied_today?: number;
    total_inspected_today?: number;
    total_inspected_today_rate?: number;
    total_pending_applications?: number;
    total_completed_applications?: number;
    applications_by_status?: ApplicationsByStatus[];
    pending_applications_by_rate_class?: PendingApplicationsByRateClass[];
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

import Input from '@/components/composables/input';
import Select from '@/components/composables/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

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
                    <p className="font-semibold text-gray-900 dark:text-white">{label || 'Rate Class'}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Pending Applications: <span className="font-bold text-blue-600">{data.value}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">Applications by rate class distribution</p>
            </div>
        );
    }
    return null;
};

const StatCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-24" />
        </CardContent>
    </Card>
);

const ChartSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-10" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex h-[300px] items-center justify-center">
                <div className="w-full space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-3/6" />
                    <Skeleton className="h-4 w-2/6" />
                    <div className="flex justify-center pt-8">
                        <Skeleton className="h-32 w-32 rounded-full" />
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function TicketDashboard({
    total_applied_today,
    total_inspected_today,
    total_inspected_today_rate,
    total_pending_applications,
    total_completed_applications,
    applications_by_status,
    pending_applications_by_rate_class,
}: DashboardProps) {
    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const breadcrumbs = [
        { title: 'CSF', href: '/tickets' },
        { title: 'Dashboard', href: '/tickets/dashboard' },
    ];

    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());

    const form = useForm({
        year: '',
        month: '',
    });

    useEffect(() => {
        form.setData({
            year: currentYear,
            month: currentMonth,
        });
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets Dashboard" />

            <div className="mt-4 space-y-6 px-4 pb-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <WhenVisible data="total_applied_today" fallback={<StatCardSkeleton />}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Applied Today</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{total_applied_today}</div>
                                <p className="text-xs text-muted-foreground">All time applications</p>
                            </CardContent>
                        </Card>
                    </WhenVisible>

                    <WhenVisible data="total_inspected_today" fallback={<StatCardSkeleton />}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Inspected Today</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{total_inspected_today}</div>
                                <p className="text-xs text-muted-foreground">{total_inspected_today_rate}% completion rate</p>
                            </CardContent>
                        </Card>
                    </WhenVisible>

                    <WhenVisible data="total_pending_applications" fallback={<StatCardSkeleton />}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Pending</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{total_pending_applications}</div>
                                <p className="text-xs text-muted-foreground">Awaiting action</p>
                            </CardContent>
                        </Card>
                    </WhenVisible>

                    <WhenVisible data="total_completed_applications" fallback={<StatCardSkeleton />}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Installed This Month</CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{total_completed_applications}</div>
                                <p className="text-xs text-muted-foreground">Applications completed this month</p>
                            </CardContent>
                        </Card>
                    </WhenVisible>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <WhenVisible data="pending_applications_by_rate_class" fallback={<ChartSkeleton />}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Application Distribution
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-24"
                                            value={form.data.year}
                                            onChange={(e) => {
                                                form.setData('year', e.target.value);
                                            }}
                                            placeholder="Year"
                                        />
                                        <Select
                                            className="w-full"
                                            value={form.data.month}
                                            onValueChange={(value) => {
                                                form.setData('month', value);
                                            }}
                                            options={[
                                                { label: 'January', value: '01' },
                                                { label: 'February', value: '02' },
                                                { label: 'March', value: '03' },
                                                { label: 'April', value: '04' },
                                                { label: 'May', value: '05' },
                                                { label: 'June', value: '06' },
                                                { label: 'July', value: '07' },
                                                { label: 'August', value: '08' },
                                                { label: 'September', value: '09' },
                                                { label: 'October', value: '10' },
                                                { label: 'November', value: '11' },
                                                { label: 'December', value: '12' },
                                            ]}
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={
                                                applications_by_status?.map((item, index) => ({
                                                    name: item.status_label,
                                                    value: item.total,
                                                    color: COLORS[index % COLORS.length],
                                                })) || []
                                            }
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {applications_by_status?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<StatusTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </WhenVisible>

                    <WhenVisible data="pending_applications_by_rate_class" fallback={<ChartSkeleton />}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Pending Applications
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-24"
                                            value={form.data.year}
                                            onChange={(e) => {
                                                form.setData('year', e.target.value);
                                            }}
                                            placeholder="Year"
                                        />
                                        <Select
                                            className="w-full"
                                            value={form.data.month}
                                            onValueChange={(value) => {
                                                form.setData('month', value);
                                            }}
                                            options={[
                                                { label: 'January', value: '01' },
                                                { label: 'February', value: '02' },
                                                { label: 'March', value: '03' },
                                                { label: 'April', value: '04' },
                                                { label: 'May', value: '05' },
                                                { label: 'June', value: '06' },
                                                { label: 'July', value: '07' },
                                                { label: 'August', value: '08' },
                                                { label: 'September', value: '09' },
                                                { label: 'October', value: '10' },
                                                { label: 'November', value: '11' },
                                                { label: 'December', value: '12' },
                                            ]}
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={pending_applications_by_rate_class?.map((item) => ({
                                            name: item.rate_class_label,
                                            value: item.total,
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<DepartmentTooltip />} />
                                        <Bar dataKey="value" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </WhenVisible>
                </div>
            </div>
        </AppLayout>
    );
}
