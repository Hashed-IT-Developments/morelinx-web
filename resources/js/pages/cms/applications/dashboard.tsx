import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { useForm, WhenVisible } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ApplicationStatuses = {
    label: string;
    value: string;
};

interface ChartData {
    name: string;
    value: number;
    color?: string;
    [key: string]: string | number | undefined;
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
    application_statuses: ApplicationStatuses[];
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
import axios from 'axios';
import { useEffect, useState } from 'react';

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
                    Applications: <span className="font-bold text-blue-600">{data.value}</span>
                </p>
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

export default function ApplicationDashboard({
    application_statuses,
    total_applied_today,
    total_inspected_today,
    total_inspected_today_rate,
    total_pending_applications,
    total_completed_applications,
    applications_by_status,
    pending_applications_by_rate_class,
}: DashboardProps) {
    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const months = [
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
    ];

    const breadcrumbs = [
        { title: 'CSF', href: '/tickets' },
        { title: 'Dashboard', href: '/tickets/dashboard' },
    ];

    const [applicationsByStatus, setApplicationsByStatus] = useState<ApplicationsByStatus[]>(applications_by_status || []);
    const [applicationsByRateClass, setApplicationsByRateClass] = useState<PendingApplicationsByRateClass[]>(
        pending_applications_by_rate_class || [],
    );

    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());

    const applicationByStatusForm = useForm({
        year: '',
        month: '',
    });

    const applicationByRateClassForm = useForm({
        year: '',
        month: '',
        status: '',
    });

    useEffect(() => {
        applicationByStatusForm.setData({
            year: currentYear,
            month: currentMonth,
        });

        applicationByRateClassForm.setData({
            year: currentYear,
            month: currentMonth,
            status: 'pending',
        });

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFetchApplicationByStatus = () => {
        axios
            .get(route('dashboard.application-by-status'), {
                params: {
                    year: applicationByStatusForm.data.year,
                    month: applicationByStatusForm.data.month,
                },
            })
            .then((response) => {
                setApplicationsByStatus(response.data);
            });
    };

    const handleFetchApplicationByRateClass = () => {
        axios
            .get(route('dashboard.application-by-rate-class'), {
                params: {
                    year: applicationByRateClassForm.data.year,
                    month: applicationByRateClassForm.data.month,
                    status: applicationByRateClassForm.data.status,
                },
            })
            .then((response) => {
                console.log('ApplicationsByRateClass Response:', response.data);
                setApplicationsByRateClass(response.data);
            });
    };

    useEffect(() => {
        handleFetchApplicationByStatus();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationByStatusForm.data.year, applicationByStatusForm.data.month]);

    useEffect(() => {
        handleFetchApplicationByRateClass();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationByRateClassForm.data.status, applicationByRateClassForm.data.month, applicationByRateClassForm.data.year]);

    return (
        <AppLayout title="Tickets Dashboard" breadcrumbs={breadcrumbs}>
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
                                            type="number"
                                            className="w-24"
                                            value={applicationByStatusForm.data.year}
                                            onChange={(e) => {
                                                applicationByStatusForm.setData('year', e.target.value);
                                            }}
                                            placeholder="Year"
                                        />
                                        <Select
                                            className="w-full"
                                            value={applicationByStatusForm.data.month}
                                            onValueChange={(value) => {
                                                applicationByStatusForm.setData('month', value);
                                            }}
                                            options={months}
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={applicationsByStatus?.map((item, index) => ({
                                                name: item.status_label,
                                                value: item.total,
                                                color: COLORS[index % COLORS.length],
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {applicationsByStatus?.map((entry, index) => (
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
                                        Applications
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            className="w-24"
                                            type="number"
                                            value={applicationByRateClassForm.data.year}
                                            onChange={(e) => {
                                                applicationByRateClassForm.setData('year', e.target.value);
                                                handleFetchApplicationByRateClass();
                                            }}
                                            placeholder="Year"
                                        />
                                        <Select
                                            className="w-full"
                                            value={applicationByRateClassForm.data.month}
                                            onValueChange={(value) => {
                                                applicationByRateClassForm.setData('month', value);
                                            }}
                                            options={months}
                                        />

                                        <Select
                                            placeholder="Status"
                                            className="w-full"
                                            value={applicationByRateClassForm.data.status}
                                            onValueChange={(value) => {
                                                console.log('Status changed to:', value);
                                                applicationByRateClassForm.setData('status', value);
                                            }}
                                            options={[
                                                {
                                                    label: 'All',
                                                    value: 'all',
                                                },
                                                ...application_statuses,
                                            ]}
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={applicationsByRateClass?.map((item) => ({
                                            name: item.rate_class_label,
                                            value: item.total,
                                        }))}
                                        style={{ fontSize: '12px' }}
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
