import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, ClipboardList, FileText, MapPin, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { DataField, EmptyState, InfoCard } from './shared-components';
import { InspectionDetail } from './types';
import { formatDate } from './utils';

interface InspectionTabProps {
    inspection: InspectionDetail | null;
    getStatusLabel: (status: string) => string;
    getStatusColor: (status: string) => string;
}

export default function InspectionTab({ inspection, getStatusLabel, getStatusColor }: InspectionTabProps) {
    const materialsUsed = useMemo(
        () => (inspection && Array.isArray(inspection.materials_used) ? inspection.materials_used : []),
        [inspection?.materials_used],
    );

    if (!inspection || typeof inspection !== 'object') {
        return (
            <EmptyState
                icon={ClipboardList}
                title="No Inspection Scheduled"
                description="An inspection will be scheduled once the application is processed and approved for the next phase."
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Information */}
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-3 dark:bg-gray-900">
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Inspection ID</p>
                    <p className="font-mono font-semibold text-green-600 dark:text-green-400">#{inspection.id}</p>
                </div>
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Status</p>
                    <Badge variant="outline" className={`${getStatusColor(inspection.status)} mt-1 text-xs font-medium`}>
                        {getStatusLabel(inspection.status)}
                    </Badge>
                </div>
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Schedule Date</p>
                    <p className="text-sm font-medium">{formatDate(inspection.schedule_date)}</p>
                </div>
            </div>

            {/* Inspection Details */}
            <InfoCard icon={FileText} title="Inspection Details" iconColor="text-green-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DataField label="Inspector" value={inspection.inspector?.name} />
                    <DataField label="Inspection Time" value={inspection.inspection_time} />
                    <DataField label="Feeder" value={inspection.feeder} />
                    <DataField label="Meter Type" value={inspection.meter_type} />
                    <DataField label="Meter Class" value={inspection.meter_class} />
                    <DataField label="Service Drop Size" value={inspection.service_drop_size} />
                    <DataField label="Protection" value={inspection.protection} />
                    <DataField label="Connected Load" value={inspection.connected_load ? `${inspection.connected_load} kVA` : null} />
                    <DataField label="Transformer Size" value={inspection.transformer_size} />
                    <DataField label="Near Meter Serial 1" value={inspection.near_meter_serial_1} />
                    <DataField label="Near Meter Serial 2" value={inspection.near_meter_serial_2} />
                </div>
            </InfoCard>

            <Separator />

            {/* Location Information */}
            <InfoCard icon={MapPin} title="Location Information" iconColor="text-red-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DataField label="House Location" value={inspection.house_loc} />
                    <DataField label="Meter Location" value={inspection.meter_loc} />
                    <div className="sm:col-span-2">
                        <DataField label="Sketch Location" value={inspection.sketch_loc} />
                    </div>
                </div>
            </InfoCard>

            <Separator />

            {/* Financial Information */}
            <InfoCard icon={Building2} title="Financial Information" iconColor="text-blue-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Bill Deposit</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">₱{Number(inspection.bill_deposit || 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Material Deposit</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ₱{Number(inspection.material_deposit || 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Labor Cost</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">₱{Number(inspection.labor_cost || 0).toFixed(2)}</p>
                    </div>
                </div>
            </InfoCard>

            <Separator />

            {/* Materials Used */}
            {materialsUsed.length > 0 && (
                <>
                    <InfoCard icon={Settings} title="Materials Used" iconColor="text-purple-600">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-2 font-semibold">Material Name</th>
                                        <th className="pb-2 font-semibold">Unit</th>
                                        <th className="pb-2 text-right font-semibold">Quantity</th>
                                        <th className="pb-2 text-right font-semibold">Unit Price</th>
                                        <th className="pb-2 text-right font-semibold">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materialsUsed.map((material, index) => {
                                        const quantity = Number(material?.quantity || 0);
                                        const amount = Number(material?.amount || 0);
                                        const total = quantity * amount;

                                        return (
                                            <tr key={material?.id || index} className="border-b last:border-0">
                                                <td className="py-2 font-medium">{material?.material_name || 'N/A'}</td>
                                                <td className="py-2">{material?.unit || 'N/A'}</td>
                                                <td className="py-2 text-right">{quantity}</td>
                                                <td className="py-2 text-right">₱{amount.toFixed(2)}</td>
                                                <td className="py-2 text-right font-medium">₱{total.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="mt-3 flex justify-end border-t pt-3">
                                <div className="flex gap-4 text-base font-bold">
                                    <span>Total:</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        ₱
                                        {materialsUsed
                                            .reduce((sum, material) => {
                                                const qty = Number(material?.quantity || 0);
                                                const amt = Number(material?.amount || 0);
                                                return sum + qty * amt;
                                            }, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    <Separator />
                </>
            )}

            {/* Remarks */}
            {inspection.remarks && (
                <>
                    <InfoCard icon={FileText} title="Remarks" iconColor="text-gray-600">
                        <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{inspection.remarks}</p>
                        </div>
                    </InfoCard>

                    <Separator />
                </>
            )}

            {/* Timestamps */}
            <InfoCard icon={Calendar} title="Timestamps" iconColor="text-teal-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DataField label="Created At" value={formatDate(inspection.created_at)} />
                    <DataField label="Last Updated" value={formatDate(inspection.updated_at)} />
                </div>
            </InfoCard>
        </div>
    );
}
