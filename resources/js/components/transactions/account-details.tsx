import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionDetail, TransactionRow } from '@/types/transactions';
import { Check, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    onViewPayableDefinitions: (payableId: number, payableName: string) => void;
    selectedPayables?: number[];
    onSelectedPayablesChange?: (payableIds: number[]) => void;
}

export default function AccountDetails({
    latestTransaction,
    transactionDetails,
    // subtotal and qty are not used - calculated locally based on selected payables
    checkedBir2306,
    checkedBir2307,
    setCheckedBir2306,
    setCheckedBir2307,
    onViewDetails,
    onViewPayableDefinitions,
    selectedPayables = [],
    onSelectedPayablesChange,
}: AccountDetailsProps) {
    // Initialize with all unpaid payables selected by default
    const [internalSelectedPayables, setInternalSelectedPayables] = useState<number[]>([]);

    useEffect(() => {
        // Default to all unpaid payables selected
        if (selectedPayables.length === 0 && transactionDetails.length > 0) {
            const unpaidPayableIds = transactionDetails.filter((detail) => Number(detail.balance || 0) > 0).map((detail) => detail.id);
            setInternalSelectedPayables(unpaidPayableIds);
            onSelectedPayablesChange?.(unpaidPayableIds);
        } else {
            setInternalSelectedPayables(selectedPayables);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionDetails]);

    const currentSelectedPayables = selectedPayables.length > 0 ? selectedPayables : internalSelectedPayables;

    const handleTogglePayable = (payableId: number) => {
        const newSelected = currentSelectedPayables.includes(payableId)
            ? currentSelectedPayables.filter((id) => id !== payableId)
            : [...currentSelectedPayables, payableId];

        setInternalSelectedPayables(newSelected);
        onSelectedPayablesChange?.(newSelected);
    };

    const handleToggleAll = () => {
        const unpaidPayables = transactionDetails.filter((detail) => Number(detail.balance || 0) > 0);
        const allUnpaidIds = unpaidPayables.map((detail) => detail.id);

        if (currentSelectedPayables.length === allUnpaidIds.length) {
            // Uncheck all
            setInternalSelectedPayables([]);
            onSelectedPayablesChange?.([]);
        } else {
            // Check all unpaid
            setInternalSelectedPayables(allUnpaidIds);
            onSelectedPayablesChange?.(allUnpaidIds);
        }
    };

    const unpaidPayables = transactionDetails.filter((detail) => Number(detail.balance || 0) > 0);
    const allUnpaidSelected = unpaidPayables.length > 0 && unpaidPayables.every((detail) => currentSelectedPayables.includes(detail.id));

    // Calculate subtotal and quantity based on ONLY selected payables
    const selectedPayableDetails = transactionDetails.filter((detail) => currentSelectedPayables.includes(detail.id));

    const calculatedSubtotal = selectedPayableDetails.reduce((sum, detail) => {
        const balance = Number(detail.balance || 0);
        return sum + balance;
    }, 0);

    const calculatedQty = selectedPayableDetails.length;

    // Calculate total amount (subtotal + FT - EWT)
    const ft = Number(latestTransaction.ft) || 0;
    const ewt = Number(latestTransaction.ewt) || 0;
    const totalAmount = calculatedSubtotal + ft - ewt;

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="mb-2 border-b pb-2 text-base font-semibold dark:border-gray-600">Account Details</div>
                <div className="mt-2 mb-2 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Account No</div>
                        <Input
                            value={latestTransaction.account_number || 'N/A'}
                            readOnly
                            className="bg-green-900 font-bold text-white dark:bg-green-800"
                        />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Meter No</div>
                        <Input
                            value={latestTransaction.meter_number || 'N/A'}
                            readOnly
                            className="bg-green-100 font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400"
                        />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Meter Status</div>
                        <Input
                            value={latestTransaction.meter_status || 'N/A'}
                            readOnly
                            className="bg-green-100 font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400"
                        />
                    </div>
                    <div className="flex items-end justify-end">
                        <div>
                            <Button
                                className="flex h-10 w-full items-center justify-center bg-green-900 px-3 py-2 font-bold text-white transition hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700"
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
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Account Name</div>
                    <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400">
                        {latestTransaction.account_name || 'N/A'}
                    </div>
                </div>
                <div className="mt-2">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Address</div>
                    <div className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400">
                        {latestTransaction.address || 'N/A'}
                    </div>
                </div>

                {/* Payables Table with Check Icon */}
                <div className="mt-6 rounded border border-green-900 dark:border-green-700">
                    <div className="flex items-center justify-between rounded-t bg-green-900 px-2 py-1 text-sm font-bold text-white dark:bg-green-800">
                        <span>Payables for Energization</span>
                        <span className="text-xs font-normal opacity-90">{calculatedQty > 0 ? `${calculatedQty} selected` : 'None selected'}</span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 bg-green-50 text-center text-xs dark:bg-green-900/30">
                                    <Checkbox
                                        checked={allUnpaidSelected}
                                        onCheckedChange={handleToggleAll}
                                        className="mx-auto"
                                        title="Select all unpaid payables"
                                    />
                                </TableHead>
                                <TableHead className="w-10 bg-green-50 text-xs dark:bg-green-900/30"></TableHead>
                                <TableHead className="bg-green-50 text-xs dark:bg-green-900/30">Payable Type</TableHead>
                                <TableHead className="bg-green-50 text-xs dark:bg-green-900/30">Bill Month</TableHead>
                                <TableHead className="bg-green-50 text-xs dark:bg-green-900/30">Status</TableHead>
                                <TableHead className="bg-green-50 text-right text-xs dark:bg-green-900/30">Amount Paid</TableHead>
                                <TableHead className="bg-green-50 text-right text-xs dark:bg-green-900/30">Balance</TableHead>
                                <TableHead className="bg-green-50 text-right text-xs dark:bg-green-900/30">Total</TableHead>
                                <TableHead className="w-20 bg-green-50 text-center text-xs dark:bg-green-900/30">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionDetails && transactionDetails.length > 0 ? (
                                transactionDetails.map((detail) => {
                                    const balance = Number(detail.balance || 0);
                                    const amountPaid = Number(detail.amount_paid || 0);
                                    const totalAmount = Number(detail.total_amount || 0);
                                    const isPaid = balance === 0 && amountPaid > 0;
                                    const isPartiallyPaid = balance > 0 && amountPaid > 0;
                                    const isSelected = currentSelectedPayables.includes(detail.id);
                                    const canSelect = balance > 0; // Can only select unpaid or partially paid

                                    return (
                                        <TableRow key={detail.id}>
                                            <TableCell className="text-center">
                                                {canSelect ? (
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleTogglePayable(detail.id)}
                                                        className="mx-auto"
                                                    />
                                                ) : (
                                                    <div className="mx-auto h-5 w-5"></div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isPaid ? (
                                                    <Check className="mx-auto h-5 w-5 text-green-600 dark:text-green-400" />
                                                ) : isPartiallyPaid ? (
                                                    <div className="mx-auto h-5 w-5 rounded-full border-2 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20">
                                                        <div className="h-full w-1/2 rounded-l-full bg-yellow-500"></div>
                                                    </div>
                                                ) : (
                                                    <div className="mx-auto h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">{detail.transaction_name || 'Unnamed Payable'}</TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">{detail.bill_month || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                                        isPaid
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : isPartiallyPaid
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}
                                                >
                                                    {detail.status?.replace('_', ' ') || 'unpaid'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-medium text-blue-700 dark:text-blue-400">
                                                ₱
                                                {amountPaid.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-medium text-red-700 dark:text-red-400">
                                                ₱
                                                {balance.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold">
                                                ₱
                                                {totalAmount.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                                                    onClick={() => onViewPayableDefinitions(detail.id, detail.transaction_name || 'Payable')}
                                                    title="View detailed breakdown"
                                                >
                                                    <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        No payables found for this account.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* BIR Forms Checklist */}
                <div className="mt-4 flex gap-2 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 dark:border-green-700 dark:bg-green-900/20">
                        <input
                            type="checkbox"
                            className="accent-green-600 dark:accent-green-500"
                            checked={checkedBir2306}
                            onChange={(e) => setCheckedBir2306(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900 dark:text-green-400">BIR Form No.2306 (FT)</span>
                        <span className="ml-2 font-bold text-green-700 dark:text-green-300">{checkedBir2306}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 dark:border-green-700 dark:bg-green-900/20">
                        <input
                            type="checkbox"
                            className="accent-green-600 dark:accent-green-500"
                            checked={checkedBir2307}
                            onChange={(e) => setCheckedBir2307(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900 dark:text-green-400">BIR Form No.2307 (EWT)</span>
                        <span className="ml-2 font-bold text-green-700 dark:text-green-300">{checkedBir2307}</span>
                    </label>
                </div>

                {/* QTY, Subtotal, FT, EWT */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900 dark:border-green-700 dark:bg-green-900/10 dark:text-green-400">
                        <div className="text-xs">FT</div>
                        <div className="text-lg font-bold">{latestTransaction.ft ? latestTransaction.ft : '0.00'}</div>
                    </div>
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900 dark:border-green-700 dark:bg-green-900/10 dark:text-green-400">
                        <div className="text-xs">EWT</div>
                        <div className="text-lg font-bold">{latestTransaction.ewt ? latestTransaction.ewt : '0.00'}</div>
                    </div>
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900 dark:bg-green-900/20 dark:text-green-400">
                        <div className="text-xs">QTY</div>
                        <div className="text-2xl font-bold">{calculatedQty}</div>
                    </div>
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900 dark:bg-green-900/20 dark:text-green-400">
                        <div className="text-xs">Sub Total</div>
                        <div className="text-2xl font-bold">{Number(calculatedSubtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900 dark:bg-green-900/20 dark:text-green-400">
                        <div className="text-xs font-semibold">TOTAL AMOUNT</div>
                        <div className="text-3xl font-bold">₱{Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {/* Credit Balance */}
                {Number(latestTransaction.credit_balance || 0) > 0 && (
                    <div className="mt-2">
                        <div className="flex flex-col items-center rounded border-2 border-blue-300 bg-blue-50 p-3 text-blue-900 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <div className="text-xs font-semibold">AVAILABLE CREDIT BALANCE</div>
                            <div className="text-2xl font-bold">
                                ₱{Number(latestTransaction.credit_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="mt-1 text-xs opacity-75">Can be applied to payment</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
