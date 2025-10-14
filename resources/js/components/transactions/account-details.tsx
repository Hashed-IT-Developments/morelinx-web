import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionDetail, TransactionRow } from '@/types/transactions';
import { Check, Info } from 'lucide-react';

interface AccountDetailsProps {
    latestTransaction: TransactionRow;
    transactionDetails: TransactionDetail[];
    subtotal: number;
    qty: number;
    checkedBir2306: boolean;
    checkedBir2307: boolean;
    setCheckedBir2306: (v: boolean) => void;
    setCheckedBir2307: (v: boolean) => void;
    onViewDetails: () => void;
}

export default function AccountDetails({
    latestTransaction,
    transactionDetails,
    subtotal,
    qty,
    checkedBir2306,
    checkedBir2307,
    setCheckedBir2306,
    setCheckedBir2307,
    onViewDetails,
}: AccountDetailsProps) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="mb-2 border-b pb-2 text-base font-semibold">Account Details</div>
                <div className="mt-2 mb-2 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <div className="mb-1 text-xs text-gray-500">Account No</div>
                        <Input value={latestTransaction.account_number || 'N/A'} readOnly className="bg-green-900 font-bold text-white" />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500">Meter No</div>
                        <Input value={latestTransaction.meter_number || 'N/A'} readOnly className="bg-green-100 font-bold text-green-900" />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500">Meter Status</div>
                        <Input value={latestTransaction.meter_status || 'N/A'} readOnly className="bg-green-100 font-bold text-green-900" />
                    </div>
                    <div className="flex items-end justify-end">
                        <div>
                            <Button
                                className="flex h-10 w-full items-center justify-center bg-green-900 px-3 py-2 font-bold text-white transition hover:bg-green-700"
                                variant="default"
                                title="Details"
                                onClick={onViewDetails}
                            >
                                <Info className="mr-3 h-4 w-4" />
                                <span className="text-sm font-medium">View Details</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="mb-1 text-xs text-gray-500">Account Name</div>
                    <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-900">{latestTransaction.account_name || 'N/A'}</div>
                </div>
                <div className="mt-2">
                    <div className="mb-1 text-xs text-gray-500">Address</div>
                    <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-900">{latestTransaction.address || 'N/A'}</div>
                </div>

                {/* Bill Table with Check Icon */}
                <div className="mt-6 rounded border border-green-900">
                    <div className="flex items-center rounded-t bg-green-900 px-2 py-1 text-sm font-bold text-white">
                        <span>Bill Month</span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 bg-green-50 text-xs"></TableHead>
                                <TableHead className="bg-green-50 text-xs">Bill Month</TableHead>
                                <TableHead className="bg-green-50 text-xs">Item Name</TableHead>
                                <TableHead className="bg-green-50 text-right text-xs">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionDetails && transactionDetails.length > 0 ? (
                                transactionDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                        <TableCell>
                                            <Check className="mx-auto h-5 w-5 text-green-600" />
                                        </TableCell>
                                        <TableCell className="text-sm">{detail.bill_month}</TableCell>
                                        <TableCell className="text-sm">{detail.transaction_code}</TableCell>
                                        <TableCell className="text-right text-sm">
                                            {Number(detail.total_amount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                                        No bill details found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* BIR Forms Checklist */}
                <div className="mt-4 flex gap-2 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2306}
                            onChange={(e) => setCheckedBir2306(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900">BIR Form No.2306 (FT)</span>
                        <span className="ml-2 font-bold text-green-700">{checkedBir2306}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2307}
                            onChange={(e) => setCheckedBir2307(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900">BIR Form No.2307 (EWT)</span>
                        <span className="ml-2 font-bold text-green-700">{checkedBir2307}</span>
                    </label>
                </div>

                {/* QTY, Subtotal, FT, EWT */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900">
                        <div className="text-xs">QTY</div>
                        <div className="text-2xl font-bold">{qty}</div>
                    </div>
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900">
                        <div className="text-xs">Sub Total</div>
                        <div className="text-2xl font-bold">{Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900">
                        <div className="text-xs">FT</div>
                        <div className="text-lg font-bold">{latestTransaction.ft ? latestTransaction.ft : '0.00'}</div>
                    </div>
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900">
                        <div className="text-xs">EWT</div>
                        <div className="text-lg font-bold">{latestTransaction.ewt ? latestTransaction.ewt : '0.00'}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
