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
                            <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">House Location</span>
                                        <span className="text-right font-medium">{inspection.house_loc}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Meter Location</span>
                                        <span className="text-right font-medium">{inspection.meter_loc}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Inspector</span>
                                        <span className="text-right font-medium">{inspection.inspector?.name}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Schedule Date</span>
                                        <span className="text-right font-medium">{inspection.schedule_date}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Inspection Time</span>
                                        <span className="text-right font-medium">{inspection.inspection_time}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Near Meter Serial 1</span>
                                        <span className="text-right font-medium">{inspection.near_meter_serial_1}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Near Meter Serial 2</span>
                                        <span className="text-right font-medium">{inspection.near_meter_serial_2}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Feeder</span>
                                        <span className="text-right font-medium">{inspection.feeder}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Meter Type</span>
                                        <span className="text-right font-medium">{inspection.meter_type}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Service Drop Size</span>
                                        <span className="text-right font-medium">{inspection.service_drop_size}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Protection</span>
                                        <span className="text-right font-medium">{inspection.protection}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Meter Class</span>
                                        <span className="text-right font-medium">{inspection.meter_class}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Connected Load</span>
                                        <span className="text-right font-medium">{inspection.connected_load}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Transformer Size</span>
                                        <span className="text-right font-medium">{inspection.transformer_size}</span>
                                    </div>

                                    <div className="flex items-start justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="mr-2 shrink-0 text-gray-500 dark:text-gray-400">Notes & Remarks</span>
                                        <span className="text-right font-medium break-words">{inspection.remarks}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <Card className="mx-4 mt-2">
                                <CardHeader>
                                    <CardTitle>Deposits & Labor Cost</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="mr-2 shrink-0 text-gray-500 dark:text-gray-400">Bill Deposit:</span>
                                        <span className="text-right font-medium break-words">{formatCurrency(inspection.bill_deposit)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="mr-2 shrink-0 text-gray-500 dark:text-gray-400">Material Deposit:</span>
                                        <span className="text-right font-medium break-words">{formatCurrency(inspection.material_deposit)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="mr-2 shrink-0 text-gray-500 dark:text-gray-400">Labor Cost:</span>
                                        <span className="text-right font-medium break-words">{formatCurrency(inspection.labor_cost)}</span>
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
