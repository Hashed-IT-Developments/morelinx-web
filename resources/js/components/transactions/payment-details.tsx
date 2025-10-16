import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentRow } from '@/types/transactions';

interface PaymentDetailsProps {
    paymentRows: PaymentRow[];
    multiplePayment: boolean;
    setMultiplePayment: (v: boolean) => void;
    paymentModes: string[];
    handlePaymentChange: (idx: number, field: string, value: string) => void;
    addPaymentRow: () => void;
    removePaymentRow: (idx: number) => void;
    subtotal: number;
}

export default function PaymentDetails({
    paymentRows,
    multiplePayment,
    setMultiplePayment,
    paymentModes,
    handlePaymentChange,
    addPaymentRow,
    removePaymentRow,
    subtotal,
}: PaymentDetailsProps) {
    // Calculate totals
    const totalPaymentAmount = paymentRows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return sum + amount;
    }, 0);

    const paymentDifference = totalPaymentAmount - subtotal;
    return (
        <Card>
            <CardContent className="p-6">
                <div className="mb-4 border-b pb-2 text-base font-semibold dark:border-gray-600">Payment</div>
                <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                        <label className="text-sm font-medium">Multiple Payment</label>
                        <input
                            type="checkbox"
                            checked={multiplePayment}
                            onChange={(e) => setMultiplePayment(e.target.checked)}
                            className="accent-green-600 dark:accent-green-500"
                        />
                    </div>
                    {paymentRows.map((row, idx) => (
                        <div key={idx} className="mb-2 flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={row.amount}
                                onChange={(e) => handlePaymentChange(idx, 'amount', e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={row.mode}
                                onChange={(e) => handlePaymentChange(idx, 'mode', e.target.value)}
                                className="rounded border px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                            >
                                {paymentModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                            {multiplePayment && paymentRows.length > 1 && (
                                <Button type="button" size="icon" variant="ghost" onClick={() => removePaymentRow(idx)} className="text-red-500">
                                    &times;
                                </Button>
                            )}
                        </div>
                    ))}
                    {multiplePayment && (
                        <Button type="button" variant="outline" className="mt-2 w-full" onClick={addPaymentRow}>
                            + Add Payment
                        </Button>
                    )}
                </div>
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">No. of Transactions</div>
                    <Input value={paymentRows.length} readOnly className="bg-green-100 font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400" />
                </div>

                {/* Total Amount */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                    <Input value={`₱${totalPaymentAmount.toFixed(2)}`} readOnly className="bg-blue-100 font-bold text-blue-900 dark:bg-blue-900/20 dark:text-blue-400" />
                </div>

                {/* Subtotal Needed to Pay */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Subtotal Needed to Pay</div>
                    <Input value={`₱${subtotal.toFixed(2)}`} readOnly className="bg-gray-100 font-bold text-gray-900 dark:bg-gray-700 dark:text-gray-200" />
                </div>

                {/* Payment Difference */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{paymentDifference >= 0 ? 'Change' : 'Balance Due'}</div>
                    <Input
                        value={`₱${Math.abs(paymentDifference).toFixed(2)}`}
                        readOnly
                        className={`font-bold ${
                            paymentDifference >= 0 
                                ? 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                    />
                </div>
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Other Details</div>
                    <Input placeholder="Settlement, Notes, etc." />
                </div>
                {/* Checklist */}
                <div className="mb-4">
                    <div className="mb-2 text-base font-semibold">Checklist</div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600 dark:accent-green-500" />
                            <span className="text-sm">Check, if payment is for settlement</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600 dark:accent-green-500" />
                            <span className="text-sm">Multiple Items</span>
                        </label>
                    </div>
                </div>
                <Button className="w-full bg-green-900 text-sm font-bold text-white dark:bg-green-800 dark:hover:bg-green-700">Settle Payment</Button>
            </CardContent>
        </Card>
    );
}
