import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Barangay {
    id: string;
    name: string;
    alias: string;
    town_id: string;
}

interface Town {
    id: string;
    name: string;
    alias: string;
    du_tag: string;
    feeder: string;
    barangays: Array<Barangay>;
}

interface Route {
    id: string;
    name: string;
    reading_day_of_month: number;
    meter_reader_id: string | null;
    barangay_id: string;
    town_id: string;
    active: number;
    disconnected: number;
    total: number;
}

interface MeterReader {
    id: string;
    name: string;
}

interface ShowRouteProps {
    route: Route;
    meterReaders: Array<MeterReader>;
    townsWithBarangay: Array<Town>;
}

interface CustomerAccount {
    id: string;
    account_name: string;
    account_number: string;
    account_status: string;
    previous_kwh: string;
    rate_class: string;
}

export default function ManageRoute({ route, meterReaders, townsWithBarangay }: ShowRouteProps) {
    const [dayOfMonth, setDayOfMonth] = useState(route.reading_day_of_month);
    const [meterReaderId, setMeterReaderid] = useState(route.meter_reader_id);
    const [cityId, setCityId] = useState(route.town_id);
    const [barangayId, setBarangayId] = useState(route.barangay_id);
    const [selectedCity, setSelectedCity] = useState({} as Town | undefined);
    const [accountsInRoute, setAccountsInRoute] = useState([] as Array<CustomerAccount>);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Routes',
            href: '/mrb/routes',
        },
        {
            title: route.name,
            href: '/mrb/routes/',
        },
    ];

    useEffect(() => {
        const town = townsWithBarangay.find((town) => (town.id = route.town_id));
        setSelectedCity(town);
        fetchAccountsInRoute();
    }, [route]);

    const fetchAccountsInRoute = () => {
        axios
            .get('/mrb/routes/get-customers-in-route-api/' + route.id)
            .then((response) => {
                setAccountsInRoute(response.data);
            })
            .catch((error) => {
                toast.error(error.message);
                console.log(error);
            });
    };

    const onSaveRoute = () => {
        const routeNameInput = document.getElementById('route-name') as HTMLInputElement;
        const routeName = routeNameInput?.value;

        axios
            .put('/mrb/routes/update-route-api/' + route.id, {
                name: routeName,
                barangay_id: route.barangay_id,
                reading_day_of_month: dayOfMonth,
                meter_reader_id: meterReaderId,
            })
            .then((response) => {
                toast.success(response.data.message);
            });
    };

    const onSuggestName = () => {
        if (!barangayId || !dayOfMonth) return;

        const town = townsWithBarangay.find((town) => town.id == route.town_id);
        const barangay = town?.barangays.find((bar) => bar.id == barangayId);

        const init = `${barangay?.alias}-${dayOfMonth}-`;

        axios
            .get('/mrb/routes/get-next-route-name-api/' + init)
            .then((response) => {
                const suggestedName = response.data.next_route_name;
                const routeNameInput = document.getElementById('route-name') as HTMLInputElement;
                if (routeNameInput) {
                    routeNameInput.value = suggestedName;
                }
            })
            .catch((error) => {
                console.error('Error fetching suggested route name:', error);
            });
    };

    const onChangeDayOfMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const day = e.target.value;
        setDayOfMonth(parseInt(day));
    };

    const onChangeMeterReader = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const readerId = e.target.value;
        setMeterReaderid(readerId);
    };

    const onChangeCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        const town = townsWithBarangay.find((town) => (town.id = cityId));
        setSelectedCity(town);
        setCityId(cityId);
    };

    const onChangeBarangay = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const barangayId = e.target.value;
        setBarangayId(barangayId);
    };

    const cn = (account_status: string) => {
        switch (account_status) {
            case 'pending':
                return 'bg-gray-200 text-gray-600';
                break;
            case 'active':
                return 'bg-green-400';
                break;
            case 'suspended':
                return 'bg-orange-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Route" />
            <div className="p-4 md:p-6">
                <Card>
                    <CardContent>
                        <CardHeader>
                            <CardTitle>Edit Route Details</CardTitle>
                        </CardHeader>
                        <CardDescription>
                            <div className="ms-6 mt-4 flex items-end justify-start gap-4">
                                <div className="relative flex flex-col gap-1">
                                    <label htmlFor="route-name" className="text-sm font-medium text-gray-700">
                                        Route Name
                                    </label>
                                    <input
                                        type="text"
                                        id="route-name"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Enter route name"
                                        defaultValue={route.name}
                                    />
                                    <RotateCcw
                                        className="absolute top-8 right-3 h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-800"
                                        onClick={onSuggestName}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="day_of_month" className="text-sm font-medium text-gray-700">
                                        Reading Day of Month
                                    </label>
                                    <select
                                        id="day_of_month"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        onChange={onChangeDayOfMonth}
                                        defaultValue={route.reading_day_of_month}
                                    >
                                        <option value="">Select reading day of month</option>
                                        {[...Array(31)].map((_, index) => (
                                            <option key={index + 1} value={index + 1}>
                                                {index + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="meter_reader" className="text-sm font-medium text-gray-700">
                                        Meter Reader
                                    </label>
                                    <select
                                        id="meter_reader"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        onChange={onChangeMeterReader}
                                        defaultValue={route.meter_reader_id as string}
                                    >
                                        <option value="">Select a meter reader</option>
                                        {meterReaders.map((reader) => (
                                            <option key={reader.id} value={reader.id}>
                                                {reader.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button className="bg-green-600 hover:bg-green-500" onClick={onSaveRoute}>
                                    <CheckCircle /> Save
                                </Button>
                            </div>
                        </CardDescription>
                    </CardContent>
                </Card>

                <div className="mt-8 text-gray-500">
                    Manage Accounts in this Route
                    <div className="flex gap-4">
                        <Card className="flex-1">
                            <CardContent>
                                <CardHeader>
                                    <CardTitle>Add Accounts to this Route</CardTitle>
                                </CardHeader>
                                <CardDescription>
                                    <div className="ms-6 flex gap-4 py-4">
                                        <div className="relative flex flex-col gap-1">
                                            <label htmlFor="route-name" className="text-sm font-medium text-gray-700">
                                                Search Account
                                            </label>
                                            <input
                                                type="text"
                                                id="route-name"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                placeholder="Account name or number"
                                            />
                                            <Search
                                                className="absolute top-8 right-3 h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-800"
                                                onClick={onSuggestName}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label htmlFor="day_of_month" className="text-sm font-medium text-gray-700">
                                                Municipality/City
                                            </label>
                                            <select
                                                id="day_of_month"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                onChange={onChangeCity}
                                                defaultValue={selectedCity?.id}
                                            >
                                                <option value="">Select city/municipality</option>
                                                {townsWithBarangay.map((town) => (
                                                    <option key={town.id} value={town.id}>
                                                        {town.name} ({town.alias})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label htmlFor="day_of_month" className="text-sm font-medium text-gray-700">
                                                Barangay
                                            </label>
                                            <select
                                                id="day_of_month"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                onChange={onChangeBarangay}
                                                defaultValue={route.barangay_id}
                                            >
                                                <option value="">Select barangay</option>
                                                {selectedCity?.barangays?.map((barangay) => (
                                                    <option key={barangay.id} value={barangay.id}>
                                                        {barangay.name} ({barangay.alias})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <Table className="mt-4">
                                        <TableHeader>
                                            <TableRow className="bg-gray-100">
                                                <TableHead className="text-black">
                                                    <Checkbox />
                                                </TableHead>
                                                <TableHead className="text-black">Customer Name/Account #</TableHead>
                                                <TableHead className="text-black">Current Route</TableHead>
                                                <TableHead className="text-black">Customer Type</TableHead>
                                                <TableHead className="text-center text-black">Account Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableHead className="text-black">
                                                    <Checkbox />
                                                </TableHead>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableHead className="text-black">
                                                    <Checkbox />
                                                </TableHead>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableHead className="text-black">
                                                    <Checkbox />
                                                </TableHead>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                                <TableCell>&nbsp;</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="flex-1">
                            <CardContent>
                                <CardHeader>
                                    <CardTitle>Accounts already existing in this Route</CardTitle>
                                    <div className="text-gray-500">
                                        {route.active} Active ● {route.disconnected} Disconnected ● {route.total} Total
                                    </div>
                                </CardHeader>
                                <CardDescription>
                                    <Table className="mt-4">
                                        <TableHeader>
                                            <TableRow className="bg-gray-100">
                                                <TableHead className="text-black">Customer Name/Account #</TableHead>
                                                <TableHead className="text-black">Customer Type</TableHead>
                                                <TableHead className="text-black">Account Status</TableHead>
                                                <TableHead className="text-center text-black">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accountsInRoute.map((account) => (
                                                <TableRow>
                                                    <TableCell>
                                                        <div>{account.account_name}</div>
                                                        <div className="text-gray-500">{account.account_number}</div>
                                                    </TableCell>
                                                    <TableCell>{account.rate_class}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(account.account_status)}>{account.account_status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" className="text-red-700">
                                                            <Trash2></Trash2>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
