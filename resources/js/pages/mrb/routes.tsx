import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meter Reading Routes',
        href: '/mrb/routes',
    },
];

interface Town {
    id: string;
    name: string;
    alias: string;
    du_tag: string;
    feeder: string;
    barangays: Array<{
        id: string;
        name: string;
        alias: string;
    }>;
}

interface Route {
    id: string;
    name: string;
    reading_day_of_month: number;
    meter_reader_id: string | null;
    barangay_id: string;
    active: number;
    disconnected: number;
    total: number;
}

interface MeterReader {
    id: string;
    name: string;
}

interface RoutesProps {
    townsWithBarangay?: Array<Town>;
    meterReaders?: Array<MeterReader>;
}

export default function Routes({ townsWithBarangay = [], meterReaders = [] }: RoutesProps) {
    const [selectedCity, setSelectedCity] = useState({} as Town);
    const [selectedBarangay, setSelectedBarangay] = useState('');
    const [routes, setRoutes] = useState([] as Array<Route>);

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Routes" />

            <div className="p-4 md:p-6">
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
                        <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
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

                    <Button onClick={handleFilter} className="bg-green-600 hover:bg-green-700">
                        <Search /> Filter
                    </Button>
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
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
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
        </AppLayout>
    );
}
