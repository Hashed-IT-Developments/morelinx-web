import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { RotateCcw } from 'lucide-react';
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

interface MeterReader {
    id: string;
    name: string;
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

interface EditRouteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    townsWithBarangay: Array<Town>;
    meterReaders: Array<MeterReader>;
    onEdit: () => void;
    selectedRoute: Route;
}

export default function EditRouteDialog({ onOpenChange, open, townsWithBarangay, meterReaders, onEdit, selectedRoute }: EditRouteProps) {
    const [selectedDayOfMonth, setSelectedDayOfMonth] = useState(0);
    const [selectedCity, setSelectedCity] = useState({} as Town | undefined);
    const [selectedBarangay, setSelectedBarangay] = useState({} as Barangay | undefined);
    const [selectedMeterReader, setSelectedMeterReader] = useState('');

    useEffect(() => {
        const town = townsWithBarangay.find((item) => item.id == selectedRoute.town_id);
        setSelectedCity(town);
        const barangay = town?.barangays?.find((item) => item.id == selectedRoute.barangay_id);
        setSelectedBarangay(barangay);
        setSelectedDayOfMonth(selectedRoute.reading_day_of_month);
    }, [selectedRoute]);

    const onSuggestName = () => {
        if (!selectedBarangay || !selectedDayOfMonth) return;

        const init = `${selectedBarangay.alias}-${selectedDayOfMonth}-`;

        axios
            .get(route('mrb.routes.get-next-route-name-api', { initial: init }))
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
        const day = parseInt(e.target.value, 10);
        setSelectedDayOfMonth(day);
    };

    const onChangeCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        const town = townsWithBarangay.find((item) => item.id == cityId);
        setSelectedCity(town);
    };

    const onChangeBarangay = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const barangayId = e.target.value;
        const barangay = selectedCity?.barangays.find((item) => item.id == barangayId);
        setSelectedBarangay(barangay);
    };

    const onChangeMeterReader = (e: React.ChangeEvent<HTMLSelectElement>) => {};

    const onSaveRoute = () => {
        const routeNameInput = document.getElementById('route-name') as HTMLInputElement;
        const meterReaderSelect = document.getElementById('meter_reader') as HTMLSelectElement;

        const routeName = routeNameInput?.value;
        const meterReaderId = meterReaderSelect?.value;

        if (!selectedBarangay || !selectedDayOfMonth || !routeName || !meterReaderId) {
            toast.error('Please fill in all required fields.');
            console.log(selectedBarangay, selectedDayOfMonth, routeName);
            return;
        }

        axios
            .put(route('mrb.routes.update-route-api', selectedRoute.id), {
                barangay_id: selectedBarangay.id,
                reading_day_of_month: selectedDayOfMonth,
                name: routeName,
                meter_reader_id: meterReaderId || null,
            })
            .then((response) => {
                toast.success(response.data.message);
                // const newRoute = response.data.route;
                // newRoute.active = "0"
                // newRoute.disconnected = "0"
                // newRoute.total = "0"
                onEdit();
                onOpenChange(false);
            })
            .catch((error) => {
                toast.error('Error creating route:' + error.message);
                console.log(error);
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full md:min-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Route</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex flex-col gap-4">
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
                            defaultValue={selectedBarangay?.id}
                        >
                            <option value="">Select barangay</option>
                            {selectedCity?.barangays?.map((barangay) => (
                                <option key={barangay.id} value={barangay.id}>
                                    {barangay.name} ({barangay.alias})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="day_of_month" className="text-sm font-medium text-gray-700">
                            Reading Day of Month
                        </label>
                        <select
                            id="day_of_month"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            onChange={onChangeDayOfMonth}
                            defaultValue={selectedRoute.reading_day_of_month}
                        >
                            <option value="">Select reading day of month</option>
                            {[...Array(31)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative flex flex-col gap-1">
                        <label htmlFor="route-name" className="text-sm font-medium text-gray-700">
                            Route Name
                        </label>
                        <input
                            type="text"
                            id="route-name"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter route name"
                            defaultValue={selectedRoute.name}
                        />
                        <RotateCcw
                            className="absolute top-8 right-3 h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-800"
                            onClick={onSuggestName}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="meter_reader" className="text-sm font-medium text-gray-700">
                            Assign Meter Reader
                        </label>
                        <select
                            id="meter_reader"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            onChange={onChangeMeterReader}
                            defaultValue={selectedRoute.meter_reader_id as string}
                        >
                            <option value="">Select a meter reader</option>
                            {meterReaders.map((reader) => (
                                <option key={reader.id} value={reader.id}>
                                    {reader.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="mr-3 rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </button>
                        <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={onSaveRoute}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
