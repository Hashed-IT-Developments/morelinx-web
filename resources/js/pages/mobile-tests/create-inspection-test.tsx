import { useForm } from '@inertiajs/react';
import MobileLayout from './layouts/mobile-layout';

interface CreateInspectionTestFormData {
    inspectors: User[];
    statuses: string[];
    inspections?: Inspection[];
}
export default function CreateInspectionTest({ inspectors, statuses, inspections }: CreateInspectionTestFormData) {
    const form = useForm({
        customer_application_id: '',
        inspector_id: '',
        inspection_id: '',
        status: '',
        house_loc: '',
        meter_loc: '',
        sketch_loc: '',
        near_meter_serial_1: '',
        near_meter_serial_2: '',
        schedule_date: '',
        bill_deposit: '',
        material_deposit: '',
        total_labor_costs: '',
        labor_cost: '',
        feeder: '',
        meter_type: '',
        service_drop_size: '',
        protection: '',
        meter_class: '',
        connected_load: '',
        transformer_size: '',
        signature: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/tests/mobile/update-inspection/' + form.data.inspection_id, {
            onSuccess: () => {
                console.log('Form submitted successfully');
            },
            onError: (errors) => {
                console.error('Form submission error:', errors);
            },
        });
    };
    return (
        <MobileLayout>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
                className="space-y-4 p-4"
            >
                <div>
                    <label className="mb-1 block text-sm font-medium">Customer Application ID</label>
                    <input
                        type="number"
                        name="customer_application_id"
                        value={form.data.customer_application_id}
                        onChange={(e) => form.setData('customer_application_id', e.target.value)}
                        required
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Inspector</label>
                    <select
                        name="inspector_id"
                        value={form.data.inspector_id}
                        onChange={(e) => form.setData('inspector_id', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        required
                    >
                        <option value="">Select inspector</option>
                        {inspectors.map((inspector) => (
                            <option key={inspector.id} value={inspector.id}>
                                {inspector.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Inspection</label>
                    <select
                        name="inspection_id"
                        value={form.data.inspection_id}
                        onChange={(e) => form.setData('inspection_id', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        required
                    >
                        <option value="">Select inspection</option>
                        {inspections &&
                            inspections.map((inspection) => (
                                <option key={inspection.id} value={inspection.id}>
                                    {inspection.id} {inspection.status} - {inspection?.customer_application?.first_name}{' '}
                                    {inspection?.customer_application?.last_name}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Status</label>
                    <select
                        name="status"
                        value={form.data.status}
                        onChange={(e) => form.setData('status', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    >
                        <option value="">Select status</option>WW
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">House Location</label>
                    <input
                        type="text"
                        name="house_loc"
                        value={form.data.house_loc}
                        onChange={(e) => form.setData('house_loc', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Meter Location</label>
                    <input
                        type="text"
                        name="meter_loc"
                        value={form.data.meter_loc}
                        onChange={(e) => form.setData('meter_loc', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Sketch Location</label>
                    <input
                        type="text"
                        name="sketch_loc"
                        value={form.data.sketch_loc}
                        onChange={(e) => form.setData('sketch_loc', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Near Meter Serial 1</label>
                    <input
                        type="text"
                        name="near_meter_serial_1"
                        value={form.data.near_meter_serial_1}
                        onChange={(e) => form.setData('near_meter_serial_1', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Near Meter Serial 2</label>
                    <input
                        type="text"
                        name="near_meter_serial_2"
                        value={form.data.near_meter_serial_2}
                        onChange={(e) => form.setData('near_meter_serial_2', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Schedule Date</label>
                    <input
                        type="date"
                        name="schedule_date"
                        value={form.data.schedule_date}
                        onChange={(e) => form.setData('schedule_date', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Bill Deposit</label>
                    <input
                        type="number"
                        name="bill_deposit"
                        value={form.data.bill_deposit}
                        onChange={(e) => form.setData('bill_deposit', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        step="any"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Material Deposit</label>
                    <input
                        type="number"
                        name="material_deposit"
                        value={form.data.material_deposit}
                        onChange={(e) => form.setData('material_deposit', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        step="any"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Total Labor Costs</label>
                    <input
                        type="number"
                        name="total_labor_costs"
                        value={form.data.total_labor_costs}
                        onChange={(e) => form.setData('total_labor_costs', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        step="any"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Labor Cost</label>
                    <input
                        type="number"
                        name="labor_cost"
                        value={form.data.total_labor_cost}
                        onChange={(e) => form.setData('labor_cost', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        step="any"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Feeder</label>
                    <input
                        type="text"
                        name="feeder"
                        value={form.data.feeder}
                        onChange={(e) => form.setData('feeder', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Meter Type</label>
                    <input
                        type="text"
                        name="meter_type"
                        value={form.data.meter_type}
                        onChange={(e) => form.setData('meter_type', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Service Drop Size</label>
                    <input
                        type="text"
                        name="service_drop_size"
                        value={form.data.service_drop_size}
                        onChange={(e) => form.setData('service_drop_size', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Protection</label>
                    <input
                        type="text"
                        name="protection"
                        value={form.data.protection}
                        onChange={(e) => form.setData('protection', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Meter Class</label>
                    <input
                        type="text"
                        name="meter_class"
                        value={form.data.meter_class}
                        onChange={(e) => form.setData('meter_class', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Connected Load</label>
                    <input
                        type="text"
                        name="connected_load"
                        value={form.data.connected_load}
                        onChange={(e) => form.setData('connected_load', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Transformer Size</label>
                    <input
                        type="text"
                        name="transformer_size"
                        value={form.data.transformer_size}
                        onChange={(e) => form.setData('transformer_size', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Signature</label>
                    <input
                        type="text"
                        name="signature"
                        value={form.data.signature}
                        onChange={(e) => form.setData('signature', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Remarks</label>
                    <textarea
                        name="remarks"
                        value={form.data.remarks}
                        onChange={(e) => form.setData('remarks', e.target.value)}
                        className="w-full rounded border px-2 py-1"
                    />
                </div>
                <button type="submit" className="mt-4 w-full rounded bg-blue-600 py-2 text-white" disabled={form.processing}>
                    Submit
                </button>
            </form>
        </MobileLayout>
    );
}
