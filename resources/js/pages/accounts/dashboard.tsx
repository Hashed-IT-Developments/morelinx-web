import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { WhenVisible } from '@inertiajs/react';
import { AlertTriangle, Ban, CheckCircle, Clock } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    pending: number;
    activated: number;
    suspended: number;
}

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

export default function Dashboard({ pending, activated, suspended }: DashboardProps) {
    const pieData = [
        {
            name: 'pending',
            value: pending,
        },
        {
            name: 'activated',
            value: activated,
        },
        {
            name: 'suspended',
            value: suspended,
        },
    ];

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '#',
        },
    ];
    return (
        <main>
            <AppLayout title="Dashboard" breadcrumbs={breadcrumbs} className="overflow-y-hidden">
                <div className="mt-4 space-y-6 px-4 pb-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <WhenVisible data="total_applied_today" fallback={<StatCardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Pendings</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pending}</div>
                                </CardContent>
                            </Card>
                        </WhenVisible>

                        <WhenVisible data="total_inspected_today" fallback={<StatCardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Activated</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{activated}</div>
                                </CardContent>
                            </Card>
                        </WhenVisible>

                        <WhenVisible data="total_pending_applications" fallback={<StatCardSkeleton />}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Suspended</CardTitle>
                                    <Ban className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{suspended}</div>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                        <WhenVisible data="pieData" fallback={ChartSkeleton}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Account by Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData?.map((item, index) => ({
                                                    name: item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('_', ' '),
                                                    value: item.value,
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
                                                {pieData
                                                    ?.map((item, index) => ({
                                                        name: item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('_', ' '),
                                                        value: item.value,
                                                        color: COLORS[index % COLORS.length],
                                                    }))
                                                    .map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </WhenVisible>
                    </div>
                </div>
            </AppLayout>
        </main>
    );
}
