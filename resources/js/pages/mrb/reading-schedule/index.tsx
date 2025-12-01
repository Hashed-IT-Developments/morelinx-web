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
import { Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reading Scheduler',
        href: '/mrb/reading/schedule',
    },
];

interface ReadingScheduleRow {
    id: string;
    routes: string;
    routeLabel?: string;
    readingDate: string;
    activeAccounts: number;
    disconnectedAccounts: number;
    totalAccounts: number;
    meterReader: string;
}

interface AccountDetail {
    id: string;
    customerName: string;
    accountNumber: string;
    status: 'Active' | 'Disconnected';
    previousKWH: number;
}

interface RouteDetails {
    routes: string;
    accounts: AccountDetail[];
}

export default function MeterReadingScheduleIndex() {
    const [billingMonth, setBillingMonth] = useState('November 2025');
    const [openModal, setOpenModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);

    // Sample data - replace with actual data from props
    const scheduleData: ReadingScheduleRow[] = [
        {
            id: '1',
            routes: 'BOOL-16-001',
            routeLabel: 'Secondary Info',
            readingDate: '16',
            activeAccounts: 200,
            disconnectedAccounts: 3,
            totalAccounts: 203,
            meterReader: 'Julio Lopez',
        },
        {
            id: '2',
            routes: 'BOOL-16-002',
            routeLabel: 'Customer Optimization Producer',
            readingDate: '16',
            activeAccounts: 142,
            disconnectedAccounts: 4,
            totalAccounts: 146,
            meterReader: 'Julio Lopez',
        },
        {
            id: '3',
            routes: 'BOOL-16-003-01',
            routeLabel: 'Customer Marketing Planner',
            readingDate: '16',
            activeAccounts: 100,
            disconnectedAccounts: 5,
            totalAccounts: 104,
            meterReader: 'Julio Lopez',
        },
        {
            id: '4',
            routes: 'BOOL-16-003-02',
            routeLabel: 'International Usability Facilitator',
            readingDate: '16',
            activeAccounts: 165,
            disconnectedAccounts: 1,
            totalAccounts: 166,
            meterReader: 'Julio Lopez',
        },
        {
            id: '5',
            routes: 'BOOL-16-004',
            routeLabel: 'Future Functionality Strategist',
            readingDate: '16',
            activeAccounts: 144,
            disconnectedAccounts: 12,
            totalAccounts: 156,
            meterReader: 'Julio Lopez',
        },
        {
            id: '6',
            routes: 'DMPS-02-001',
            routeLabel: 'Secondary Info',
            readingDate: '02',
            activeAccounts: 152,
            disconnectedAccounts: 0,
            totalAccounts: 152,
            meterReader: 'Julio Lopez',
        },
        {
            id: '7',
            routes: 'DMPS-03-001',
            routeLabel: 'Secondary Info',
            readingDate: '03',
            activeAccounts: 189,
            disconnectedAccounts: 6,
            totalAccounts: 195,
            meterReader: 'Julio Lopez',
        },
        {
            id: '8',
            routes: 'DMPS-04',
            routeLabel: 'Secondary Info',
            readingDate: '04',
            activeAccounts: 93,
            disconnectedAccounts: 14,
            totalAccounts: 107,
            meterReader: 'Julio Lopez',
        },
        {
            id: '9',
            routes: 'MNSS-21-001',
            routeLabel: 'Secondary Info',
            readingDate: '21',
            activeAccounts: 101,
            disconnectedAccounts: 2,
            totalAccounts: 103,
            meterReader: 'Julio Lopez',
        },
        {
            id: '10',
            routes: 'MNSS-22-001',
            routeLabel: 'Secondary Info',
            readingDate: '22',
            activeAccounts: 100,
            disconnectedAccounts: 2,
            totalAccounts: 102,
            meterReader: 'Julio Lopez',
        },
        {
            id: '11',
            routes: 'MNSS-03-001',
            routeLabel: 'Secondary Info',
            readingDate: '03',
            activeAccounts: 198,
            disconnectedAccounts: 7,
            totalAccounts: 205,
            meterReader: 'Julio Lopez',
        },
        {
            id: '12',
            routes: 'DAO-01-004',
            routeLabel: 'Secondary Info',
            readingDate: '01',
            activeAccounts: 203,
            disconnectedAccounts: 9,
            totalAccounts: 212,
            meterReader: 'Julio Lopez',
        },
    ];

    // Account details data for each route
    const routeAccountsData: Record<string, AccountDetail[]> = {
        'BOOL-16-001': [
            {
                id: '1',
                customerName: 'John Doe',
                accountNumber: '191223417401',
                status: 'Disconnected',
                previousKWH: 719.0,
            },
            {
                id: '2',
                customerName: 'Mary Poppins',
                accountNumber: '191223417402',
                status: 'Disconnected',
                previousKWH: 198.0,
            },
            {
                id: '3',
                customerName: 'Bryce Smith',
                accountNumber: '191223417403',
                status: 'Active',
                previousKWH: 674.0,
            },
            {
                id: '4',
                customerName: 'Jessica Tsu',
                accountNumber: '191223417404',
                status: 'Active',
                previousKWH: 393.0,
            },
            {
                id: '5',
                customerName: 'Tyler Robbins',
                accountNumber: '191223417406',
                status: 'Active',
                previousKWH: 731.0,
            },
            {
                id: '6',
                customerName: 'Harry Cone',
                accountNumber: '191223417405',
                status: 'Disconnected',
                previousKWH: 197.0,
            },
            {
                id: '7',
                customerName: 'Joe Mama',
                accountNumber: '191223417407',
                status: 'Active',
                previousKWH: 970.0,
            },
            {
                id: '8',
                customerName: 'Robert De Niro',
                accountNumber: '191223417408',
                status: 'Disconnected',
                previousKWH: 448.0,
            },
            {
                id: '9',
                customerName: 'Patty Mills',
                accountNumber: '191223417409',
                status: 'Disconnected',
                previousKWH: 764.0,
            },
            {
                id: '10',
                customerName: 'Carson Moddy',
                accountNumber: '191223417410',
                status: 'Disconnected',
                previousKWH: 385.0,
            },
        ],
    };

    const handleViewDetails = (route: ReadingScheduleRow) => {
        const accounts = routeAccountsData[route.routes] || [];
        setSelectedRoute({
            routes: route.routes,
            accounts,
        });
        setOpenModal(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Schedule" />
            <div className="p-4 md:p-6">
                {/* Header Section */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:w-48">
                        <label htmlFor="billingMonth">Set Billing Month</label>
                        <Select value={billingMonth} onValueChange={setBillingMonth}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="November 2025">November 2025</SelectItem>
                                <SelectItem value="October 2025">October 2025</SelectItem>
                                <SelectItem value="September 2025">September 2025</SelectItem>
                                <SelectItem value="August 2025">August 2025</SelectItem>
                                <SelectItem value="July 2025">July 2025</SelectItem>
                            </SelectContent>
                        </Select>
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
                                    {scheduleData.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{row.routes}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.routeLabel}</span>
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
                                                        <SelectItem value="Julio Lopez">Julio Lopez</SelectItem>
                                                        <SelectItem value="John Doe">John Doe</SelectItem>
                                                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="icon-sm"
                                                        variant="ghost"
                                                        title="View details"
                                                        onClick={() => handleViewDetails(row)}
                                                    >
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
                                <DialogTitle className="text-xl">{selectedRoute?.routes}</DialogTitle>
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
                                    {selectedRoute?.accounts && selectedRoute.accounts.length > 0 ? (
                                        selectedRoute.accounts.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{account.customerName}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{account.accountNumber}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={account.status === 'Active' ? 'default' : 'secondary'}
                                                        className={
                                                            account.status === 'Active'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        }
                                                    >
                                                        {account.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{account.previousKWH.toFixed(2)}</TableCell>
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
