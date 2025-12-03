import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import MobileLayout from './layouts/mobile-layout';

interface EnergizationTestFormData {
    linemans: User[];
    statuses: string[];
    energizations?: Energization[];
}

const defaultMeter = {
    meter_serial_number: '',
    meter_brand: '',
    seal_number: '',
    erc_seal: '',
    more_seal: '',
    multiplier: '',
    voltage: '',
    initial_reading: '',
    type: '',
};

export default function EnergizationTestCreatePage({ linemans, statuses, energizations }: EnergizationTestFormData) {
    console.log('Energizations:', energizations);
    const [meters, setMeters] = useState([{ ...defaultMeter }]);
    const form = useForm({
        status: '',
        energization_id: '',
        team_assigned_id: '',
        service_connection: '',
        action_taken: '',
        remarks: '',
        time_of_arrival: '',
        date_installed: '',
        transformer_owned: '',
        transformer_rating: '',
        ct_serial_number: '',
        ct_brand_name: '',
        ct_ratio: '',
        pt_serial_number: '',
        pt_brand_name: '',
        pt_ratio: '',
        team_executed_id: '',
        archive: false,
        meters: [{ ...defaultMeter }],
    });

    const handleMeterChange = (index: number, field: string, value: string) => {
        const updatedMeters = meters.map((meter, i) => (i === index ? { ...meter, [field]: value } : meter));
        setMeters(updatedMeters);
        form.setData('meters', updatedMeters);
    };

    const addMeter = () => {
        const updatedMeters = [...meters, { ...defaultMeter }];
        setMeters(updatedMeters);
        form.setData('meters', updatedMeters);
    };

    const removeMeter = (index: number) => {
        if (meters.length === 1) return;
        const updatedMeters = meters.filter((_, i) => i !== index);
        setMeters(updatedMeters);
        form.setData('meters', updatedMeters);
    };

    const handleSubmit = () => {
        form.put(`/tests/mobile/update-energization/${form.data.energization_id}`);
    };
    return (
        <MobileLayout>
            <div className="p-4">
                <h1>Energization</h1>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div>
                        <label className="mb-1 block font-medium">Meters</label>
                        {meters.map((meter, idx) => (
                            <div key={idx} className="mb-2 rounded border p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Serial Number"
                                        value={meter.meter_serial_number}
                                        onChange={(e) => handleMeterChange(idx, 'meter_serial_number', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Brand"
                                        value={meter.meter_brand}
                                        onChange={(e) => handleMeterChange(idx, 'meter_brand', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Seal Number"
                                        value={meter.seal_number}
                                        onChange={(e) => handleMeterChange(idx, 'seal_number', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="ERC Seal"
                                        value={meter.erc_seal}
                                        onChange={(e) => handleMeterChange(idx, 'erc_seal', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="MORE Seal"
                                        value={meter.more_seal}
                                        onChange={(e) => handleMeterChange(idx, 'more_seal', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Multiplier"
                                        type="number"
                                        value={meter.multiplier}
                                        onChange={(e) => handleMeterChange(idx, 'multiplier', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Voltage"
                                        type="number"
                                        value={meter.voltage}
                                        onChange={(e) => handleMeterChange(idx, 'voltage', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Initial Reading"
                                        type="number"
                                        value={meter.initial_reading}
                                        onChange={(e) => handleMeterChange(idx, 'initial_reading', e.target.value)}
                                    />
                                    <input
                                        className="rounded border px-3 py-2"
                                        placeholder="Type"
                                        value={meter.type}
                                        onChange={(e) => handleMeterChange(idx, 'type', e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="mt-2 text-sm text-red-600"
                                    onClick={() => removeMeter(idx)}
                                    disabled={meters.length === 1}
                                >
                                    Remove Meter
                                </button>
                            </div>
                        ))}
                        <button type="button" className="rounded bg-green-600 px-3 py-1 text-white" onClick={addMeter}>
                            Add Meter
                        </button>
                    </div>

                    <div>
                        <label className="mb-1 block font-medium" htmlFor="energization_id">
                            Energization
                        </label>
                        <select
                            name="energization_id"
                            id="energization_id"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.energization_id}
                            onChange={(e) => form.setData('energization_id', e.target.value)}
                        >
                            <option value="">Select Energization</option>
                            {energizations &&
                                energizations.map((energization) => (
                                    <option key={energization.id} value={energization.id}>
                                        {energization?.customer_application?.first_name} {energization?.customer_application?.last_name} -{' '}
                                        {energization.status}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Status</label>
                        <select
                            name="status"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="">Select status</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Team Assigned</label>
                        <select
                            name="team_assigned_id"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.team_assigned_id}
                            onChange={(e) => form.setData('team_assigned_id', e.target.value)}
                        >
                            <option value="">Select a lineman</option>
                            {linemans.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Service Connection</label>
                        <input
                            type="text"
                            name="service_connection"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.service_connection}
                            onChange={(e) => form.setData('service_connection', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Action Taken</label>
                        <input
                            type="text"
                            name="action_taken"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.action_taken}
                            onChange={(e) => form.setData('action_taken', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Remarks</label>
                        <input
                            type="text"
                            name="remarks"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Time of Arrival</label>
                        <input
                            type="datetime-local"
                            name="time_of_arrival"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.time_of_arrival}
                            onChange={(e) => form.setData('time_of_arrival', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Date Installed</label>
                        <input
                            type="date"
                            name="date_installed"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.date_installed}
                            onChange={(e) => form.setData('date_installed', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Transformer Owned</label>
                        <input
                            type="text"
                            name="transformer_owned"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.transformer_owned}
                            onChange={(e) => form.setData('transformer_owned', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Transformer Rating</label>
                        <input
                            type="text"
                            name="transformer_rating"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.transformer_rating}
                            onChange={(e) => form.setData('transformer_rating', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">CT Serial Number</label>
                        <input
                            type="text"
                            name="ct_serial_number"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.ct_serial_number}
                            onChange={(e) => form.setData('ct_serial_number', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">CT Brand Name</label>
                        <input
                            type="text"
                            name="ct_brand_name"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.ct_brand_name}
                            onChange={(e) => form.setData('ct_brand_name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">CT Ratio</label>
                        <input
                            type="text"
                            name="ct_ratio"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.ct_ratio}
                            onChange={(e) => form.setData('ct_ratio', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">PT Serial Number</label>
                        <input
                            type="text"
                            name="pt_serial_number"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.pt_serial_number}
                            onChange={(e) => form.setData('pt_serial_number', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">PT Brand Name</label>
                        <input
                            type="text"
                            name="pt_brand_name"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.pt_brand_name}
                            onChange={(e) => form.setData('pt_brand_name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">PT Ratio</label>
                        <input
                            type="text"
                            name="pt_ratio"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.pt_ratio}
                            onChange={(e) => form.setData('pt_ratio', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Team Executed</label>
                        <select
                            name="team_executed_id"
                            className="w-full rounded border px-3 py-2"
                            value={form.data.team_executed_id}
                            onChange={(e) => form.setData('team_executed_id', e.target.value)}
                        >
                            <option value="">Select a lineman</option>
                            {linemans.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="archive"
                            id="archive"
                            className="mr-2"
                            checked={form.data.archive}
                            onChange={(e) => form.setData('archive', e.target.checked)}
                        />
                        <label htmlFor="archive" className="font-medium">
                            Archive
                        </label>
                    </div>
                    <button type="submit" className="w-full rounded bg-blue-600 py-2 font-bold text-white">
                        Submit
                    </button>
                </form>
            </div>
        </MobileLayout>
    );
}
