import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Eye, Loader2, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reading Scheduler',
        href: '/mrb/reading/schedule',
    },
];

interface ReadingScheduleRow {
    id: string;
    route: RouteDetails;
    barangay: string;
    readingDate: string;
    activeAccounts: number;
    disconnectedAccounts: number;
    totalAccounts: number;
    meterReader: string;
}

interface MeterReader {
    id: string;
    name: string;
    email: string;
}

interface AccountDetail {
    id: string;
    account_name: string;
    account_number: string;
    account_status: 'Active' | 'Disconnected';
    previousKWH: number;
}

interface RouteDetails {
    id: string;
    name: string;
    customerAccounts: AccountDetail[];
}

interface Props {
    meterReaders: MeterReader[];
}

export default function MeterReadingScheduleIndex({ meterReaders }: Props) {
    const [billingMonth, setBillingMonth] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
    const [readingSchedule, setReadingSchedule] = useState<ReadingScheduleRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleViewDetails = (readingSchedule: ReadingScheduleRow) => {
        setSelectedRoute(null);
        //fetching customer accounts from this route.
        axios.get(route('mrb.reading.accounts-in-route', { route: readingSchedule.route.id })).then((response) => {
            setSelectedRoute({
                id: readingSchedule.route.id,
                name: readingSchedule.route.name,
                customerAccounts: response.data.customerAccounts,
            });
            console.log(response.data.customerAccounts);
        });
        setOpenModal(true);
    };

    useEffect(() => {
        if (billingMonth === '') return;
        setIsLoading(true);
        setReadingSchedule([]);
        axios
            .patch(route('mrb.reading.schedule.generate-or-fetch', { billing_month: billingMonth }))
            .then((response) => {
                setReadingSchedule(response.data.reading_schedules);
                toast.success(response.data.message);
            })
            .catch((error) => {
                toast.error(error.message);
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [billingMonth]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Schedule" />
            <div className="p-4 md:p-6">
                {/* Header Section */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:w-75">
                        <label htmlFor="billingMonth">Set Billing Month</label>
                        <div className="flex items-center gap-2">
                            <Select value={billingMonth} onValueChange={setBillingMonth}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const date = new Date();
                                        date.setMonth(date.getMonth() - 3 + i);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const monthName = date.toLocaleString('default', { month: 'long' });
                                        return (
                                            <SelectItem key={`${year}-${month}`} value={`${year}-${month}`}>
                                                {monthName} {year}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            {isLoading && <Loader2 className="animate-spin" />}
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                        <TableHead className="w-32">Routes</TableHead>
                                        <TableHead className="w-20">Reading Date</TableHead>
                                        <TableHead className="w-32 text-center">Active Accounts</TableHead>
                                        <TableHead className="w-32 text-center">Disconnected Accounts</TableHead>
                                        <TableHead className="w-28 text-center">Total Accounts</TableHead>
                                        <TableHead className="w-32">Meter Reader</TableHead>
                                        <TableHead className="w-20 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(readingSchedule as Array<ReadingScheduleRow>).map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{row.route.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.barangay}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{row.readingDate}</TableCell>
                                            <TableCell className="text-center">{row.activeAccounts}</TableCell>
                                            <TableCell className="text-center">{row.disconnectedAccounts}</TableCell>
                                            <TableCell className="text-center font-medium">{row.totalAccounts}</TableCell>
                                            <TableCell>
                                                <Select defaultValue={row.meterReader}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Unassigned</SelectItem>
                                                        {meterReaders.map((reader) => (
                                                            <SelectItem key={reader.id} value={reader.id}>
                                                                {reader.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon-sm" variant="ghost">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem title="View details" onClick={() => handleViewDetails(row)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline">Clear</Button>
                    <Button className="bg-green-600 hover:bg-green-700">Save Sched</Button>
                </div>

                {/* Account Details Modal */}
                <Dialog open={openModal} onOpenChange={setOpenModal}>
                    <DialogContent className="max-w-5xl min-w-5xl">
                        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <DialogTitle className="text-xl">{selectedRoute?.name}</DialogTitle>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">List Of Accounts in this Route</p>
                            </div>
                            <DialogClose />
                        </DialogHeader>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                        <TableHead>Customer Name / Account number</TableHead>
                                        <TableHead className="text-center">Account Status</TableHead>
                                        <TableHead className="text-center">Previous KWH</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedRoute?.customerAccounts && selectedRoute.customerAccounts.length > 0 ? (
                                        selectedRoute.customerAccounts.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{account.account_name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{account.account_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={account.account_status === 'Active' ? 'default' : 'secondary'}
                                                        className={
                                                            account.account_status === 'Active'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        }
                                                    >
                                                        {account.account_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{account.previousKWH?.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="icon-sm" variant="ghost" title="View details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon-sm" variant="ghost">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                                                No accounts found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
