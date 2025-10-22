import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PaymentRow } from '@/types/transactions';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface PaymentDetailsProps {
    paymentRows: PaymentRow[];
    handlePaymentChange: (idx: number, field: string, value: string) => void;
    addPaymentRow: () => void;
    removePaymentRow: (idx: number) => void;
    subtotal: number;
}

export default function PaymentDetails({ paymentRows, handlePaymentChange, addPaymentRow, removePaymentRow, subtotal }: PaymentDetailsProps) {
    // State for checkboxes and settlement notes
    const [isSettlement, setIsSettlement] = useState(false);
    const [settlementNotes, setSettlementNotes] = useState('');
    const [settlementError, setSettlementError] = useState('');
    const [openDatePickers, setOpenDatePickers] = useState<{ [key: number]: boolean }>({});

    // Multiple items is automatically determined by payment rows count
    const isMultipleItems = paymentRows.length > 1;

    // Calculate totals
    const totalPaymentAmount = paymentRows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return sum + amount;
    }, 0);

    const paymentDifference = totalPaymentAmount - subtotal;

    // Full payment is automatically determined by balance due being 0 or positive (overpayment)
    const isFullPayment = paymentDifference >= 0;

    // When full payment is auto-checked, clear settlement
    if (isFullPayment && isSettlement) {
        setIsSettlement(false);
        setSettlementNotes('');
    }

    // Determine if settle button should be enabled
    const canSettle = isFullPayment || isSettlement;

    // Handle settle payment click
    const handleSettlePayment = () => {
        // Clear any previous errors
        setSettlementError('');

        // If settlement is checked but no notes provided, show error
        if (isSettlement && !settlementNotes.trim()) {
            setSettlementError('Settlement notes are required when marking as settlement');
            return;
        }

        // Proceed with settlement logic here
        console.log('Processing settlement...');
    };
    return (
        <Card>
            <CardContent className="p-6">
                <div className="mb-4 border-b pb-2 text-base font-semibold dark:border-gray-600">Payment</div>
                <div className="mb-4">
                    {paymentRows.map((row, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="mb-2 flex items-center gap-2">
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
                                    {idx === 0 ? (
                                        // First payment row - all options available
                                        <>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Check">Check</option>
                                        </>
                                    ) : (
                                        // Additional payment rows - only Card and Check
                                        <>
                                            <option value="Card">Card</option>
                                            <option value="Check">Check</option>
                                        </>
                                    )}
                                </select>
                                {paymentRows.length > 1 && idx > 0 && (
                                    <Button type="button" size="icon" variant="ghost" onClick={() => removePaymentRow(idx)} className="text-red-500">
                                        &times;
                                    </Button>
                                )}
                            </div>

                            {/* Additional fields for Check payment */}
                            {row.mode === 'Check' && (
                                <div className="ml-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Check Number</div>
                                        <Input
                                            type="text"
                                            placeholder="Enter check number"
                                            value={row.check_number ?? ''}
                                            onChange={(e) => handlePaymentChange(idx, 'check_number', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Check Issue Date</div>
                                        <Popover
                                            open={openDatePickers[idx] || false}
                                            onOpenChange={(open) => setOpenDatePickers((prev) => ({ ...prev, [idx]: open }))}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between font-normal">
                                                    {row.check_issue_date ? new Date(row.check_issue_date).toLocaleDateString() : 'Select date'}
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={row.check_issue_date ? new Date(row.check_issue_date) : undefined}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const pad = (n: number) => n.toString().padStart(2, '0');
                                                            const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                            handlePaymentChange(idx, 'check_issue_date', formatted);
                                                        } else {
                                                            handlePaymentChange(idx, 'check_issue_date', '');
                                                        }
                                                        setOpenDatePickers((prev) => ({ ...prev, [idx]: false }));
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}

                            {/* Additional fields for Card payment */}
                            {row.mode === 'Card' && (
                                <div className="ml-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Bank</div>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            value={row.bank ?? ''}
                                            onChange={(e) => handlePaymentChange(idx, 'bank', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Bank Transaction Number</div>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            value={row.bank_transaction_number ?? ''}
                                            onChange={(e) => handlePaymentChange(idx, 'bank_transaction_number', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="mt-2 w-full" onClick={addPaymentRow}>
                        + Add Payment
                    </Button>
                </div>
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">No. of Transactions</div>
                    <Input
                        value={paymentRows.length}
                        readOnly
                        className="bg-green-100 font-bold text-green-900 dark:bg-green-900/20 dark:text-green-400"
                    />
                </div>

                {/* Total Amount */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                    <Input
                        value={`₱${totalPaymentAmount.toFixed(2)}`}
                        readOnly
                        className="bg-blue-100 font-bold text-blue-900 dark:bg-blue-900/20 dark:text-blue-400"
                    />
                </div>

                {/* Subtotal Needed to Pay */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Subtotal Needed to Pay</div>
                    <Input
                        value={`₱${subtotal.toFixed(2)}`}
                        readOnly
                        className="bg-gray-100 font-bold text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                    />
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

                {/* Checklist */}
                <div className="mb-4">
                    <div className="mb-2 text-base font-semibold">Checklist</div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600 dark:accent-green-500" checked={isFullPayment} disabled readOnly />
                            <span className="text-sm">Final settlement (mark as fully paid)</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="accent-green-600 dark:accent-green-500"
                                checked={isSettlement}
                                onChange={(e) => setIsSettlement(e.target.checked)}
                                disabled={isFullPayment}
                            />
                            <span className="text-sm">Mark as settlement</span>
                        </label>

                        {/* Settlement Notes - only show if settlement is checked and full payment is not checked */}
                        {isSettlement && !isFullPayment && (
                            <div className="mt-2 ml-6">
                                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Settlement Notes</div>
                                <Input
                                    placeholder="Enter settlement details..."
                                    value={settlementNotes}
                                    onChange={(e) => {
                                        setSettlementNotes(e.target.value);
                                        setSettlementError(''); // Clear error when user types
                                    }}
                                />
                                {settlementError && <div className="mt-1 text-xs text-red-500">{settlementError}</div>}
                            </div>
                        )}

                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600 dark:accent-green-500" checked={isMultipleItems} disabled readOnly />
                            <span className="text-sm">Multiple items/invoices</span>
                        </label>
                    </div>
                </div>
                <Button
                    className="w-full bg-green-900 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-800 dark:hover:bg-green-700"
                    disabled={!canSettle}
                    onClick={handleSettlePayment}
                >
                    Settle Payment
                </Button>
            </CardContent>
        </Card>
    );
}
