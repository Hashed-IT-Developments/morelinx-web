import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatSplitWords, getStatusColor } from '@/lib/utils';

interface InpectionsProps {
    inspections: Inspection[];
}

export default function Inpections({ inspections }: InpectionsProps) {
    return (
        <main>
            <section>
                {inspections.map((inspection) => (
                    <div key={inspection.id} className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center">
                                <CardTitle>Inspection Details</CardTitle>

                                <Badge className={getStatusColor(inspection.status)}>{formatSplitWords(inspection.status)}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>House Location:</h1> <span>{inspection.house_loc}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Meter Location:</h1> <span>{inspection.meter_loc}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Inspector:</h1> <span>{inspection.inspector?.name}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Schedule Date:</h1> <span>{inspection.schedule_date}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Near Meter Serial 1:</h1> <span>{inspection.near_meter_serial_1}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Near Meter Serial 2:</h1> <span>{inspection.near_meter_serial_2}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Inspection Time:</h1> <span>{inspection.inspection_time}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Feeder:</h1> <span>{inspection.feeder}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Meter Type:</h1> <span>{inspection.meter_type}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Service Drop Size:</h1> <span>{inspection.service_drop_size}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Protection:</h1> <span>{inspection.protection}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Meter Class:</h1> <span>{inspection.meter_class}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Connected Load:</h1> <span>{inspection.connected_load}</span>
                                </div>
                                <div className="mb-2 grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                                    <h1>Transformer Size:</h1> <span>{inspection.transformer_size}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pb-2">
                                    <h1>Notes & Remarks:</h1> <span>{inspection.remarks}</span>
                                </div>
                            </CardContent>

                            <Card className="mx-4 mt-2">
                                <CardHeader>
                                    <CardTitle>Deposits & Labor Cost</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2 pb-2">
                                        <h1>Bill Deposit:</h1>
                                        <span>{formatCurrency(inspection.bill_deposit)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pb-2">
                                        <h1>Material Deposit:</h1>
                                        <span>{formatCurrency(inspection.material_deposit)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pb-2">
                                        <h1>Labor Cost:</h1>
                                        <span>{formatCurrency(inspection.labor_cost)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Materials Used</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inspection.materials_used && inspection.materials_used.length > 0 ? (
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Material Name</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Total Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inspection.materials_used.map((material) => (
                                                    <TableRow key={material.id}>
                                                        <TableCell>{material.material_name}</TableCell>
                                                        <TableCell>{material.unit}</TableCell>
                                                        <TableCell>{material.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(material.amount)}</TableCell>
                                                        <TableCell>{formatCurrency(material.total_amount)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="flex justify-end border-t pt-4">
                                            <div className="flex gap-4 text-sm font-bold">
                                                <span>Grand Total:</span>
                                                <span>
                                                    {formatCurrency(
                                                        inspection.materials_used.reduce((sum, material) => sum + material.total_amount, 0),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No materials used for this inspection</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <iframe
                                    width="100%"
                                    height="450"
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://maps.google.com/maps?q=${inspection.house_loc}&z=12&output=embed`}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </section>
        </main>
    );
}
