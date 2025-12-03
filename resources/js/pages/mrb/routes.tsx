import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Eye, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateRouteDialog from './create-route-dialog';
import EditRouteDialog from './edit-route-dialog';
import ViewRoute from './view-route-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Routes',
        href: '/mrb/routes',
    },
];

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

interface RoutesProps {
    townsWithBarangay: Array<Town>;
    meterReaders?: Array<MeterReader>;
}

export default function Routes({ townsWithBarangay = [], meterReaders = [] }: RoutesProps) {
    const [selectedCity, setSelectedCity] = useState({} as Town);
    const [selectedBarangay, setSelectedBarangay] = useState({} as Barangay);
    const [selectedBarangayId, setSelectedBarangayId] = useState('');
    const [routes, setRoutes] = useState([] as Array<Route>);
    const [showCreateRoute, setShowCreateRoute] = useState(false);
    const [enableCreate, setEnableCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState({} as Route);

    useEffect(() => {
        if (selectedBarangayId && selectedCity) setEnableCreate(true);
        else setEnableCreate(false);
    }, [selectedCity, selectedBarangayId]);

    useEffect(() => {
        const barangay = selectedCity.barangays?.find((b) => b.id === selectedBarangayId);
        if (barangay) {
            setSelectedBarangay(barangay);
        }
    }, [selectedBarangayId, selectedCity.barangays]);

    const handleFilter = () => {
        axios
            .get(route('mrb.get-routes-api'), {
                params: {
                    barangay_id: selectedBarangay,
                },
            })
            .then((response) => {
                setRoutes(response.data);
            });
    };

    const onSelectCity = (value: string) => {
        const town = townsWithBarangay.find((town) => town.id === value);
        if (town) {
            setSelectedCity(town);
            setSelectedBarangayId('');
        }
    };

    const updateMeterReader = (id: string, value: string) => {
        axios
            .put(route('mrb.routes.update-meter-reader-api'), {
                route_id: id,
                meter_reader_id: value,
            })
            .then((response) => {
                toast.success(response.data.message);
            })
            .catch((error) => {
                console.error('Failed to update meter reader:', error);
            });
    };

    const onCreate = () => {
        handleFilter();
    };

    const onFinishedEdit = () => {
        handleFilter();
    };

    const onEditRoute = (route: Route) => {
        setSelectedRoute(route);
        setShowEdit(true);
    };

    const onViewRoute = (route: Route) => {
        setSelectedRoute(route);
        setShowView(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Routes" />

            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-end justify-between">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="city" className="text-sm font-medium text-gray-700">
                                City/Municipality
                            </label>
                            <Select value={selectedCity.id} onValueChange={onSelectCity}>
                                <SelectTrigger className="w-full lg:w-80">
                                    <SelectValue placeholder="Select a City/Municipality" />
                                </SelectTrigger>
                                <SelectContent>
                                    {townsWithBarangay.map((town) => (
                                        <SelectItem key={town.id} value={town.id}>
                                            {town.name} ({town.alias})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="barangay" className="text-sm font-medium text-gray-700">
                                Barangay/District
                            </label>
                            <Select value={selectedBarangay.id} onValueChange={setSelectedBarangayId}>
                                <SelectTrigger className="w-full lg:w-80">
                                    <SelectValue placeholder="Select a Barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedCity.barangays?.map((barangay) => (
                                        <SelectItem key={barangay.id} value={barangay.id}>
                                            {barangay.name} ({barangay.alias})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleFilter}>
                            <Search /> Filter
                        </Button>
                    </div>
                    <div className="flex items-center justify-end">
                        <Button className="bg-green-700 hover:bg-green-600" onClick={() => setShowCreateRoute(true)} disabled={!enableCreate}>
                            <Plus></Plus> Create Route
                        </Button>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="text-black">Route</TableHead>
                                <TableHead className="text-black">Reading Date</TableHead>
                                <TableHead className="text-black">Active Accounts</TableHead>
                                <TableHead className="text-black">Disconnected Accounts</TableHead>
                                <TableHead className="text-black">Total Accounts</TableHead>
                                <TableHead className="text-black">Meter Reader</TableHead>
                                <TableHead className="text-center text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.reading_day_of_month}</TableCell>
                                    <TableCell>{row.active}</TableCell>
                                    <TableCell>{row.disconnected}</TableCell>
                                    <TableCell>{row.total}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={row.meter_reader_id || ''}
                                            onValueChange={(value) => {
                                                updateMeterReader(row.id, value);
                                                setRoutes(routes.map((r) => (r.id === row.id ? { ...r, meter_reader_id: value } : r)));
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a Meter Reader" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {meterReaders.map((reader) => (
                                                    <SelectItem key={reader.id} value={reader.id}>
                                                        {reader.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => onEditRoute(row)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => onViewRoute(row)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateRouteDialog
                open={showCreateRoute}
                onOpenChange={setShowCreateRoute}
                selectedBarangay={selectedBarangay}
                meterReaders={meterReaders}
                onCreate={onCreate}
            />
            <EditRouteDialog
                open={showEdit}
                onOpenChange={setShowEdit}
                selectedRoute={selectedRoute}
                townsWithBarangay={townsWithBarangay}
                meterReaders={meterReaders}
                onEdit={onFinishedEdit}
            />
            <ViewRoute open={showView} onOpenChange={setShowView} route={selectedRoute} />
        </AppLayout>
    );
}
