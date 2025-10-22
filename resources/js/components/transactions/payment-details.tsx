import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod, PaymentRow } from '@/types/transactions';
import { router } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentDetailsProps {
    paymentRows: PaymentRow[];
    handlePaymentChange: (idx: number, field: string, value: string) => void;
    addPaymentRow: () => void;
    removePaymentRow: (idx: number) => void;
    subtotal: number;
    customerApplicationId?: number;
    philippineBanks?: Array<{ value: string; label: string }>;
}

export default function PaymentDetails({
    paymentRows,
    handlePaymentChange,
    addPaymentRow,
    removePaymentRow,
    subtotal,
    customerApplicationId,
    philippineBanks = [],
}: PaymentDetailsProps) {
    // State for checkboxes and settlement notes
    const [isSettlement, setIsSettlement] = useState(false);
    const [settlementNotes, setSettlementNotes] = useState('');
    const [settlementError, setSettlementError] = useState('');
    const [openDatePickers, setOpenDatePickers] = useState<{ [key: string]: boolean }>({});
    const [isProcessing, setIsProcessing] = useState(false);

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
            const errorMsg = 'Settlement notes are required when marking as settlement';
            setSettlementError(errorMsg);
            toast.error('Validation Error', {
                description: errorMsg,
                duration: 4000,
            });
            return;
        }

        // Validate payment amounts
        if (totalPaymentAmount <= 0) {
            const errorMsg = 'Please enter valid payment amounts';
            setSettlementError(errorMsg);
            toast.error('Invalid Payment Amount', {
                description: errorMsg,
                duration: 4000,
            });
            return;
        }

        // Validate that we have a customer application to process
        if (!customerApplicationId) {
            const errorMsg = 'No customer application selected';
            setSettlementError(errorMsg);
            toast.error('Selection Error', {
                description: errorMsg,
                duration: 4000,
            });
            return;
        }

        // Convert payment rows to PaymentMethod format
        const paymentMethods: PaymentMethod[] = paymentRows.map((row) => ({
            type: row.mode,
            amount: parseFloat(row.amount) || 0,
            bank: row.bank,
            check_number: row.check_number,
            check_issue_date: row.check_issue_date,
            check_expiration_date: row.check_expiration_date,
            bank_transaction_number: row.bank_transaction_number,
        }));

        // Validate required fields for each payment method
        for (const method of paymentMethods) {
            if (method.type === 'check') {
                if (!method.bank || !method.check_number || !method.check_issue_date || !method.check_expiration_date) {
                    const errorMsg = 'Please fill all required fields for check payments';
                    setSettlementError(errorMsg);
                    toast.error('Incomplete Check Information', {
                        description: 'Bank, check number, issue date, and expiration date are required for check payments.',
                        duration: 5000,
                    });
                    return;
                }
            }
            if (method.type === 'credit_card') {
                if (!method.bank || !method.bank_transaction_number) {
                    const errorMsg = 'Please fill all required fields for card payments';
                    setSettlementError(errorMsg);
                    toast.error('Incomplete Card Information', {
                        description: 'Bank and transaction number are required for card payments.',
                        duration: 5000,
                    });
                    return;
                }
            }
        }

        // Process the payment
        setIsProcessing(true);

        router.post(
            route('transactions.process-payment', customerApplicationId),
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payment_methods: paymentMethods as any,
            },
            {
                onSuccess: () => {
                    // Payment was successful - backend will redirect with flash message
                    // No need to handle here as the backend redirects with flash messages
                },
                onError: (errors: Record<string, string>) => {
                    // Handle validation or processing errors
                    console.error('Payment processing failed:', errors);

                    if (errors.message) {
                        toast.error('Payment Failed', {
                            description: errors.message,
                            duration: 6000,
                        });
                        setSettlementError(errors.message);
                    } else if (errors.errors) {
                        // Handle validation errors
                        const validationErrors = Object.values(errors.errors).flat();
                        toast.error('Validation Error', {
                            description: validationErrors.join(', '),
                            duration: 6000,
                        });
                        setSettlementError('Please fix the validation errors and try again.');
                    } else {
                        toast.error('Payment Failed', {
                            description: 'An unexpected error occurred. Please try again.',
                            duration: 6000,
                        });
                        setSettlementError('Payment processing failed. Please try again.');
                    }
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
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
                                <Select value={row.mode} onValueChange={(value) => handlePaymentChange(idx, 'mode', value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {idx === 0 ? (
                                            // First payment row - all options available
                                            <>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit_card">Card</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                            </>
                                        ) : (
                                            // Additional payment rows - only Card and Check
                                            <>
                                                <SelectItem value="credit_card">Card</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                                {paymentRows.length > 1 && idx > 0 && (
                                    <Button type="button" size="icon" variant="ghost" onClick={() => removePaymentRow(idx)} className="text-red-500">
                                        &times;
                                    </Button>
                                )}
                            </div>

                            {/* Additional fields for Check payment */}
                            {row.mode === 'check' && (
                                <div className="ml-2 grid grid-cols-1 gap-2">
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Bank</div>
                                        <Select value={row.bank ?? ''} onValueChange={(value) => handlePaymentChange(idx, 'bank', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Philippine Bank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {philippineBanks.map((bank) => (
                                                    <SelectItem key={bank.value} value={bank.value}>
                                                        {bank.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
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
                                                open={openDatePickers[`${idx}_issue`] || false}
                                                onOpenChange={(open) => setOpenDatePickers((prev) => ({ ...prev, [`${idx}_issue`]: open }))}
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
                                                            setOpenDatePickers((prev) => ({ ...prev, [`${idx}_issue`]: false }));
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Check Expiration Date</div>
                                        <Popover
                                            open={openDatePickers[`${idx}_expiry`] || false}
                                            onOpenChange={(open) => setOpenDatePickers((prev) => ({ ...prev, [`${idx}_expiry`]: open }))}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between font-normal">
                                                    {row.check_expiration_date
                                                        ? new Date(row.check_expiration_date).toLocaleDateString()
                                                        : 'Select date'}
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={row.check_expiration_date ? new Date(row.check_expiration_date) : undefined}
                                                    captionLayout="dropdown"
                                                    fromDate={row.check_issue_date ? new Date(row.check_issue_date) : new Date()}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const pad = (n: number) => n.toString().padStart(2, '0');
                                                            const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                                                            handlePaymentChange(idx, 'check_expiration_date', formatted);
                                                        } else {
                                                            handlePaymentChange(idx, 'check_expiration_date', '');
                                                        }
                                                        setOpenDatePickers((prev) => ({ ...prev, [`${idx}_expiry`]: false }));
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}

                            {/* Additional fields for Card payment */}
                            {row.mode === 'credit_card' && (
                                <div className="ml-2 grid grid-cols-1 gap-2">
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Bank</div>
                                        <Select value={row.bank ?? ''} onValueChange={(value) => handlePaymentChange(idx, 'bank', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Philippine Bank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {philippineBanks.map((bank) => (
                                                    <SelectItem key={bank.value} value={bank.value}>
                                                        {bank.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Bank Transaction Number</div>
                                        <Input
                                            type="text"
                                            placeholder="Enter transaction number"
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
                    disabled={!canSettle || isProcessing}
                    onClick={handleSettlePayment}
                >
                    {isProcessing ? 'Processing Payment...' : 'Settle Payment'}
                </Button>
            </CardContent>
        </Card>
    );
}
