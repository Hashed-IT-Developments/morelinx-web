import Input from '@/components/composables/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod, PaymentRow } from '@/types/transactions';
import { router } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StatelessOffsetInput from './stateless-offset-input';

interface PaymentDetailsProps {
    paymentRows: PaymentRow[];
    handlePaymentChange: (idx: number, field: string, value: string) => void;
    addPaymentRow: () => void;
    removePaymentRow: (idx: number) => void;
    subtotal: number;
    customerAccountId?: number;
    philippineBanks?: Array<{ value: string; label: string }>;
    selectedPayableIds?: number[]; // Add this to know which payables to pay
    availableCreditBalance?: number; // Available credit balance
    ewtAmount?: number; // EWT amount being deducted
    ewtType?: 'government' | 'commercial' | null; // Type of EWT
    subtotalBeforeEwt?: number; // Subtotal before EWT deduction
    ewtRates?: {
        government: number;
        commercial: number;
    };
    onPaymentSuccess?: () => void; // Callback after successful payment
}

export default function PaymentDetails({
    paymentRows,
    handlePaymentChange,
    addPaymentRow,
    removePaymentRow,
    subtotal,
    customerAccountId,
    philippineBanks = [],
    selectedPayableIds = [],
    availableCreditBalance,
    ewtAmount = 0,
    ewtType = null,
    subtotalBeforeEwt,
    ewtRates = { government: 0.025, commercial: 0.05 }, // Fallback to default rates
    onPaymentSuccess,
}: PaymentDetailsProps) {
    // State for checkboxes and settlement notes
    const [isSettlement, setIsSettlement] = useState(false);
    const [settlementNotes, setSettlementNotes] = useState('');
    const [settlementError, setSettlementError] = useState('');
    const [openDatePickers, setOpenDatePickers] = useState<{ [key: string]: boolean }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // State for credit balance usage
    const [useCreditBalance, setUseCreditBalance] = useState(false);
    const [creditToApply, setCreditToApply] = useState(0);

    // State for stateless OR offset
    const [orOffset, setOrOffset] = useState<number | null>(null);

    // State for confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Only enable credit balance if it exists and is greater than 0
    const hasCreditBalance = availableCreditBalance != null && availableCreditBalance > 0;

    // Multiple items is automatically determined by payment rows count
    const isMultipleItems = paymentRows.length > 1;

    // Calculate totals from payment rows (cash/check/card only)
    const cashPaymentAmount = paymentRows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return sum + amount;
    }, 0);

    // Auto-calculate credit to apply when checkbox is toggled
    const handleToggleCreditBalance = (checked: boolean) => {
        setUseCreditBalance(checked);
        if (checked && hasCreditBalance) {
            // Apply as much credit as possible (up to subtotal or available credit)
            const maxCredit = Math.min(availableCreditBalance!, subtotal);
            setCreditToApply(maxCredit);
        } else {
            setCreditToApply(0);
        }
    };

    // Adjust subtotal after applying credit
    const adjustedSubtotal = Math.max(0, subtotal - creditToApply);

    // Total payment amount includes both cash payments AND credit applied
    const totalPaymentAmount = cashPaymentAmount + creditToApply;

    const paymentDifference = totalPaymentAmount - subtotal;

    // Full payment is automatically determined by balance due being 0 or positive (overpayment)
    const isFullPayment = paymentDifference >= 0;

    // When full payment is auto-checked, clear settlement
    if (isFullPayment && isSettlement) {
        setIsSettlement(false);
        setSettlementNotes('');
    }

    // Determine if settle button should be enabled
    const canSettle = (isFullPayment || isSettlement) && subtotal > 0;

    // Add keyboard event listener for Enter key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if Enter is pressed and can settle
            if (e.key === 'Enter' && canSettle && !isProcessing && !showConfirmDialog) {
                e.preventDefault();
                setShowConfirmDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canSettle, isProcessing, showConfirmDialog]);

    // Handle settle payment button click - show confirmation dialog
    const handleSettlePaymentClick = () => {
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

        // Validate payment amounts - Allow credit-only payments
        // Either payment methods must have amount > 0 OR credit balance must be used
        if (totalPaymentAmount <= 0 && !useCreditBalance) {
            const errorMsg = 'Please enter valid payment amounts or use credit balance';
            setSettlementError(errorMsg);
            toast.error('Invalid Payment Amount', {
                description: errorMsg,
                duration: 4000,
            });
            return;
        }

        // Validate that we have a customer account to process
        if (!customerAccountId) {
            const errorMsg = 'No customer account selected';
            setSettlementError(errorMsg);
            toast.error('Selection Error', {
                description: errorMsg,
                duration: 4000,
            });
            return;
        }

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    // Handle confirmed payment processing
    const handleConfirmPayment = () => {
        // Close the dialog
        setShowConfirmDialog(false);

        // Convert payment rows to PaymentMethod format and filter out zero amounts
        const paymentMethods: PaymentMethod[] = paymentRows
            .map((row) => ({
                type: row.mode,
                amount: parseFloat(row.amount) || 0,
                bank: row.bank,
                check_number: row.check_number,
                check_issue_date: row.check_issue_date,
                check_expiration_date: row.check_expiration_date,
                bank_transaction_number: row.bank_transaction_number,
            }))
            .filter((method) => method.amount > 0); // Only include payment methods with non-zero amounts

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
            route('transactions.process-payment', customerAccountId),
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                payment_methods: paymentMethods as any,
                selected_payable_ids: selectedPayableIds, // Send selected payable IDs
                use_credit_balance: useCreditBalance, // Send credit balance usage flag
                credit_amount: creditToApply, // Send the actual credit amount to apply
                ewt_type: ewtType, // Send EWT type (government or commercial)
                ewt_amount: ewtAmount, // Send calculated EWT amount
                or_offset: orOffset, // Send stateless OR offset (if provided)
            },
            {
                onSuccess: () => {
                    // Payment was successful - backend will redirect with flash message
                    // Trigger callback to refresh cashier info
                    if (onPaymentSuccess) {
                        onPaymentSuccess();
                    }
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
                {subtotal === 0 && (
                    <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                        ⚠️ No payables selected. Please select at least one payable to pay.
                    </div>
                )}
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

                {/* Stateless OR Offset Input */}
                <div className="mb-4">
                    <StatelessOffsetInput onOffsetChange={setOrOffset} disabled={isProcessing} />
                </div>

                {/* Credit Balance Option */}
                {hasCreditBalance && (
                    <div className="mb-4">
                        <div className="rounded border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/20">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1 accent-blue-600 dark:accent-blue-500"
                                    checked={useCreditBalance}
                                    onChange={(e) => handleToggleCreditBalance(e.target.checked)}
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-blue-900 dark:text-blue-400">Use Available Credit Balance</div>
                                    <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                        Available: ₱{availableCreditBalance!.toFixed(2)}
                                    </div>
                                    {useCreditBalance && (
                                        <div className="mt-2 text-sm font-bold text-blue-800 dark:text-blue-200">
                                            Applying: ₱{creditToApply.toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                )}

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
                    {useCreditBalance && creditToApply > 0 && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Cash/Card: ₱{cashPaymentAmount.toFixed(2)} + Credit: ₱{creditToApply.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* EWT Deduction Info - Show if EWT is applied */}
                {ewtAmount > 0 && ewtType && (
                    <div className="mb-4">
                        <div className="rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20">
                            <div className="mb-2 text-xs font-semibold text-orange-900 dark:text-orange-400">EWT Deduction Applied</div>
                            <div className="space-y-1 text-xs text-orange-800 dark:text-orange-300">
                                {subtotalBeforeEwt !== undefined && (
                                    <div className="flex justify-between">
                                        <span>Subtotal before EWT:</span>
                                        <span className="font-semibold">₱{subtotalBeforeEwt.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>EWT ({(ewtRates[ewtType] * 100).toFixed(2)}%):</span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">-₱{ewtAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-orange-300 pt-1 dark:border-orange-600">
                                    <span className="font-bold">After EWT:</span>
                                    <span className="font-bold">₱{subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subtotal Needed to Pay */}
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Subtotal Needed to Pay</div>
                    <Input
                        value={`₱${adjustedSubtotal.toFixed(2)}`}
                        readOnly
                        className="bg-gray-100 font-bold text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                    />
                    {useCreditBalance && creditToApply > 0 && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Original: ₱{subtotal.toFixed(2)} - Credit: ₱{creditToApply.toFixed(2)}
                        </div>
                    )}
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
                    onClick={handleSettlePaymentClick}
                >
                    {isProcessing ? 'Processing Payment...' : 'Settle Payment'}
                </Button>

                {/* Confirmation Dialog */}
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to process this payment of ₱{totalPaymentAmount.toFixed(2)}?
                                <div className="mt-3 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Payment Amount:</span>
                                        <span className="font-semibold">₱{totalPaymentAmount.toFixed(2)}</span>
                                    </div>
                                    {useCreditBalance && creditToApply > 0 && (
                                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                            <span>Credit Applied:</span>
                                            <span className="font-semibold">₱{creditToApply.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Subtotal to Pay:</span>
                                        <span className="font-semibold">₱{adjustedSubtotal.toFixed(2)}</span>
                                    </div>
                                    {paymentDifference >= 0 ? (
                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>Change:</span>
                                            <span className="font-semibold">₱{paymentDifference.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-red-600 dark:text-red-400">
                                            <span>Balance Due:</span>
                                            <span className="font-semibold">₱{Math.abs(paymentDifference).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmPayment}
                                className="bg-green-900 hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-700"
                            >
                                Confirm Payment
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
