import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, MoreVertical, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmClearDialog from './_confirm-clear-dialog';
import EditScheduleDialog from './_edit-schedule-dialog';
import ViewScheduleDialog from './_view-schedule-dialog';

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

interface Schedule {
    id: string | null;
    route_id: string | null;
    route_name: string | null;
    reading_date: number;
    meter_reader_id: string | null;
    billing_month: string | null;
}

export default function MeterReadingScheduleIndex({ meterReaders }: Props) {
    const [billingMonth, setBillingMonth] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
    const [readingSchedule, setReadingSchedule] = useState<ReadingScheduleRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [scheduleForEdit, setScheduleForEdit] = useState<Schedule | null>(null);

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

    const onChangeMeterReader = (row: ReadingScheduleRow, value: string) => {
        axios
            .patch(route('mrb.reading.update-meter-reader-api', { readingSchedule: row.id }), {
                meter_reader_id: value,
            })
            .then((response) => {
                setReadingSchedule((prev) =>
                    prev.map((sched) =>
                        sched.id === row.id
                            ? {
                                  ...sched,
                                  meterReader: value,
                              }
                            : sched,
                    ),
                );
                toast.success(response.data.message);
            })
            .catch((error) => {
                toast.error('Failed to update meter reader.');
                console.log(error);
            });
    };

    const onClear = () => {
        setReadingSchedule([]);
        setBillingMonth('');
    };

    const onEditSchedule = (e: React.MouseEvent, row: ReadingScheduleRow) => {
        e.preventDefault();

        setScheduleForEdit({
            id: row.id,
            route_id: row.route.id,
            route_name: row.route.name,
            reading_date: parseInt(row.readingDate),
            meter_reader_id: row.meterReader === '0' ? null : row.meterReader,
            billing_month: billingMonth,
        });

        setOpenEditDialog(true);
        console.log(openEditDialog, scheduleForEdit);
    };

    const onScheduleUpdate = (updatedSchedule: Schedule) => {
        setReadingSchedule((prev) =>
            prev.map((sched) =>
                sched.id === updatedSchedule.id
                    ? {
                          ...sched,
                          readingDate: String(updatedSchedule.reading_date),
                          meterReader: updatedSchedule.meter_reader_id || '0',
                      }
                    : sched,
            ),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Schedule" />
            <div className="p-4 md:p-6">
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
                                                <Select defaultValue={row.meterReader} onValueChange={(value) => onChangeMeterReader(row, value)}>
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
                                                            <DropdownMenuItem onClick={(e) => onEditSchedule(e, row)}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem title="View details" onClick={() => handleViewDetails(row)}>
                                                                View Details
                                                            </DropdownMenuItem>
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

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="destructive" onClick={() => setOpenClearDialog(true)}>
                        <RefreshCcw /> Clear Schedule
                    </Button>
                    {/* <Button className="bg-green-600 hover:bg-green-700">Save Sched</Button> */}
                </div>
            </div>
            <ConfirmClearDialog openModal={openClearDialog} setOpenModal={setOpenClearDialog} billingMonth={billingMonth} onClear={onClear} />
            <ViewScheduleDialog openModal={openModal} setOpenModal={setOpenModal} selectedRoute={selectedRoute} />
            <EditScheduleDialog
                openModal={openEditDialog}
                setOpenModal={setOpenEditDialog}
                meterReaders={meterReaders}
                schedule={scheduleForEdit}
                onUpdate={onScheduleUpdate}
            />
        </AppLayout>
    );
}
