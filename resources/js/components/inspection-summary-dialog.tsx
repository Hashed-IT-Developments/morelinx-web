import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStatusUtils } from '@/lib/status-utils';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import { Calendar, ClipboardList, DollarSign, FileText, MapPin, Package, PenTool, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- Types ---
interface InspectionMaterial {
    id: number;
    material_name: string;
    unit: string;
    quantity: number;
    amount: number;
    total_amount: number;
}

interface InspectionPayable {
    id: number;
    type: string;
    payable_category: string;
    total_amount_due: number;
    amount_paid: number;
    balance: number;
    status: string;
}

interface InspectionSummary {
    id: number;
    status: string;
    house_loc: string | null;
    meter_loc: string | null;
    schedule_date: string | null;
    inspection_time: string | null;
    sketch_loc: string | null;
    near_meter_serial_1: string | null;
    near_meter_serial_2: string | null;
    feeder: string | null;
    meter_type: string | null;
    service_drop_size: string | null;
    protection: string | null;
    meter_class: string | null;
    connected_load: number | null;
    transformer_size: string | null;
    bill_deposit: number | null;
    material_deposit: number | null;
    labor_cost: number | null;
    total_labor_costs: number | null;
    signature: string | null;
    remarks: string | null;
    created_at: string;
    updated_at: string;

    inspector: {
        id: number;
        name: string;
    } | null;

    customer_application: {
        id: number;
        account_number: string;
        full_name: string;
        identity: string;
        email_address: string | null;
        mobile_1: string | null;
    } | null;

    materials_used: InspectionMaterial[];
    payables: InspectionPayable[];
}

interface InspectionSummaryDialogProps {
    inspectionId: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function InspectionSummaryDialog({ inspectionId, open, onOpenChange }: InspectionSummaryDialogProps) {
    const [inspection, setInspection] = useState<InspectionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    const fetchInspectionSummary = useCallback(async () => {
        if (!inspectionId) return;

        setLoading(true);
        try {
            const response = await axios.get(route('inspections.summary', { inspection: inspectionId }) + '?v=' + Date.now(), {
                validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            });

            if (response.status === 200) {
                setInspection(response.data);
            } else {
                toast.error(`Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error('Failed to load inspection details.');
            }
        } finally {
            setLoading(false);
        }
    }, [inspectionId]);

    useEffect(() => {
        if (open && inspectionId) {
            setInspection(null);
            fetchInspectionSummary();
        }

        if (!open) {
            setInspection(null);
        }
    }, [open, inspectionId, fetchInspectionSummary]);

    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const formatDateTime = (dateString?: string | null) =>
        dateString
            ? new Date(dateString).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : 'N/A';

    const totalMaterialsCost = inspection?.materials_used?.reduce((sum, material) => sum + material.total_amount, 0) || 0;

    return (
        <main>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl gap-0 p-0">
                    <DialogHeader className="border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ClipboardList className="h-5 w-5" />
                            Inspection Summary
                        </DialogTitle>
                        <DialogDescription>Detailed information about the inspection</DialogDescription>
                    </DialogHeader>

                    <section className="max-h-[calc(100vh-18rem)] overflow-y-auto p-4">
                        {loading ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            </div>
                        ) : inspection ? (
                            <div className="space-y-6">
                                {/* Header Information */}
                                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3 dark:bg-gray-900">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Inspection ID</p>
                                        <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">#{inspection.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                        <Badge variant="outline" className={`${getStatusColor(inspection.status)} mt-1 font-medium`}>
                                            {getStatusLabel(inspection.status)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Schedule Date</p>
                                        <p className="font-medium">{formatDate(inspection.schedule_date)}</p>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                {inspection.customer_application && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <User className="h-5 w-5" />
                                                Customer Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                                                    <p className="font-mono font-medium">{inspection.customer_application.account_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                                                    <p className="font-medium">{inspection.customer_application.identity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                                    <p className="font-medium">{inspection.customer_application.email_address || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile</p>
                                                    <p className="font-medium">{inspection.customer_application.mobile_1 || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />
                                    </>
                                )}

                                {/* Inspection Details */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <FileText className="h-5 w-5" />
                                        Inspection Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Inspector</p>
                                            <p className="font-medium">{inspection.inspector?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Inspection Time</p>
                                            <p className="font-medium">{inspection.inspection_time || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Feeder</p>
                                            <p className="font-medium">{inspection.feeder || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Meter Type</p>
                                            <p className="font-medium">{inspection.meter_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Meter Class</p>
                                            <p className="font-medium">{inspection.meter_class || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Service Drop Size</p>
                                            <p className="font-medium">{inspection.service_drop_size || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Protection</p>
                                            <p className="font-medium">{inspection.protection || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Connected Load</p>
                                            <p className="font-medium">{inspection.connected_load ? `${inspection.connected_load} kVA` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Transformer Size</p>
                                            <p className="font-medium">{inspection.transformer_size || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Near Meter Serial 1</p>
                                            <p className="font-medium">{inspection.near_meter_serial_1 || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Near Meter Serial 2</p>
                                            <p className="font-medium">{inspection.near_meter_serial_2 || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Location Information */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <MapPin className="h-5 w-5" />
                                        Location Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">House Location</p>
                                            <p className="font-medium">{inspection.house_loc || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Meter Location</p>
                                            <p className="font-medium">{inspection.meter_loc || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sketch Location</p>
                                            <p className="font-medium">{inspection.sketch_loc || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Financial Information */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <DollarSign className="h-5 w-5" />
                                        Financial Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Bill Deposit</p>
                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(inspection.bill_deposit || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Material Deposit</p>
                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(inspection.material_deposit || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Labor Cost</p>
                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(inspection.labor_cost || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Materials Used */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Package className="h-5 w-5" />
                                        Materials Used
                                    </h3>
                                    {inspection.materials_used && inspection.materials_used.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto rounded-lg border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Material Name</TableHead>
                                                            <TableHead>Unit</TableHead>
                                                            <TableHead className="text-right">Quantity</TableHead>
                                                            <TableHead className="text-right">Unit Price</TableHead>
                                                            <TableHead className="text-right">Total Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {inspection.materials_used.map((material) => (
                                                            <TableRow key={material.id}>
                                                                <TableCell className="font-medium">{material.material_name}</TableCell>
                                                                <TableCell>{material.unit}</TableCell>
                                                                <TableCell className="text-right">{material.quantity}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(material.amount)}</TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(material.total_amount)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="flex justify-end border-t pt-4">
                                                <div className="flex gap-4 text-base font-bold">
                                                    <span>Grand Total:</span>
                                                    <span className="text-green-600 dark:text-green-400">{formatCurrency(totalMaterialsCost)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400">No materials used for this inspection</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Signature */}
                                {inspection.signature && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <PenTool className="h-5 w-5" />
                                                Customer Signature
                                            </h3>
                                            <div className="flex justify-center rounded-lg border bg-white p-6 dark:bg-gray-900">
                                                <img
                                                    src={inspection.signature}
                                                    alt="Customer Signature"
                                                    className="max-h-64 max-w-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML =
                                                                '<p class="text-sm text-gray-500 dark:text-gray-400">Signature image could not be loaded</p>';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <Separator />
                                    </>
                                )}

                                {/* Payables */}
                                {inspection.payables && inspection.payables.length > 0 && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <DollarSign className="h-5 w-5" />
                                                Payables
                                            </h3>
                                            <div className="overflow-x-auto rounded-lg border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead className="text-right">Total Due</TableHead>
                                                            <TableHead className="text-right">Amount Paid</TableHead>
                                                            <TableHead className="text-right">Balance</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {inspection.payables.map((payable) => (
                                                            <TableRow key={payable.id}>
                                                                <TableCell className="font-medium">{payable.type}</TableCell>
                                                                <TableCell>{payable.payable_category}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(payable.total_amount_due)}
                                                                </TableCell>
                                                                <TableCell className="text-right">{formatCurrency(payable.amount_paid)}</TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(payable.balance)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={getStatusColor(payable.status)}>
                                                                        {getStatusLabel(payable.status)}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        <Separator />
                                    </>
                                )}

                                {/* Remarks */}
                                {inspection.remarks && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <FileText className="h-5 w-5" />
                                                Remarks
                                            </h3>
                                            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                                                <p className="text-gray-700 dark:text-gray-300">{inspection.remarks}</p>
                                            </div>
                                        </div>

                                        <Separator />
                                    </>
                                )}

                                {/* Timestamps */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5" />
                                        Timestamps
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                                            <p className="font-medium">{formatDateTime(inspection.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                                            <p className="font-medium">{formatDateTime(inspection.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No inspection data found</p>
                            </div>
                        )}
                    </section>

                    <DialogFooter className="flex justify-end border-t p-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
