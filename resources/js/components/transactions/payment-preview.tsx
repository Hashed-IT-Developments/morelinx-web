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

interface AllocationDetail {
    payable_id: number;
    amount: number;
    cash_payment?: number;
    ewt_withheld?: number;
    total_amount_covered?: number;
    original_balance: number;
    current_balance?: number;
    remaining_balance?: number;
    is_taxable: boolean;
    type: string;
    is_fully_paid?: boolean;
}

interface PaymentPreview {
    cash_payment: number;
    credit_applied: number;
    total_payment: number;
    actual_ewt_amount: number;
    ewt_type?: 'government' | 'commercial' | null;
    ewt_rate_percentage?: number;
    taxable_balance_paid?: number;
    frontend_ewt_estimate?: number;
    subtotal_before_ewt: number;
    subtotal_after_ewt: number;
    amount_needed_after_credit: number;
    is_overpayment: boolean;
    change_or_balance: number;
    allocations: AllocationDetail[];
}

interface PaymentPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preview: PaymentPreview | null;
    onConfirm: () => void;
}

export default function PaymentPreviewDialog({ open, onOpenChange, preview, onConfirm }: PaymentPreviewDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                    <AlertDialogDescription>Please review the payment details calculated by the backend.</AlertDialogDescription>
                </AlertDialogHeader>
                {preview ? (
                    <div className="max-h-[calc(90vh-200px)] space-y-3 overflow-y-auto pr-2 text-sm">
                        {/* Payment Methods Breakdown */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Payment Methods</div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Cash/Card/Check:</span>
                                    <span className="font-semibold">₱{preview.cash_payment.toFixed(2)}</span>
                                </div>
                                {preview.credit_applied > 0 && (
                                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                        <span>+ Credit Balance:</span>
                                        <span className="font-semibold">₱{preview.credit_applied.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-gray-300 pt-1 font-bold dark:border-gray-600">
                                    <span>Total Payment:</span>
                                    <span>₱{preview.total_payment.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* EWT Calculation (if applicable) */}
                        {preview.actual_ewt_amount > 0 && preview.ewt_type && (
                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20">
                                <div className="mb-2 text-xs font-semibold text-orange-900 dark:text-orange-400">EWT Calculation</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>EWT Type:</span>
                                        <span className="font-semibold capitalize">{preview.ewt_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>EWT Rate:</span>
                                        <span className="font-semibold">{(preview.ewt_rate_percentage ?? 0).toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxable Amount Paid:</span>
                                        <span className="font-semibold">₱{(preview.taxable_balance_paid ?? 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-orange-300 pt-1 font-bold text-orange-700 dark:border-orange-600 dark:text-orange-400">
                                        <span>EWT Withheld:</span>
                                        <span>₱{preview.actual_ewt_amount.toFixed(2)}</span>
                                    </div>
                                    {preview.frontend_ewt_estimate !== undefined && preview.frontend_ewt_estimate !== preview.actual_ewt_amount && (
                                        <div className="mt-2 rounded bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                            <strong>Note:</strong> Actual EWT (₱{preview.actual_ewt_amount.toFixed(2)}) differs from frontend estimate
                                            (₱{preview.frontend_ewt_estimate.toFixed(2)}) due to partial payment allocation.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payables Being Paid with EWT Details */}
                        {preview.allocations.length > 0 && (
                            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-900/20">
                                <div className="mb-2 text-xs font-semibold text-purple-800 dark:text-purple-400">
                                    Payables Being Paid ({preview.allocations.length})
                                </div>
                                <div className="space-y-2 text-xs">
                                    {preview.allocations.map((allocation, index) => {
                                        // Use the actual EWT withheld for this specific payable from backend
                                        const ewtForThisPayable = allocation.ewt_withheld ?? 0;

                                        return (
                                            <div
                                                key={allocation.payable_id}
                                                className="rounded border border-purple-300 bg-white p-2 dark:border-purple-600 dark:bg-purple-950/30"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-purple-900 dark:text-purple-300">
                                                            Payable #{index + 1}
                                                            {allocation.is_taxable && (
                                                                <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                                                                    Subject to EWT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                                                            Type: <span className="font-medium capitalize">{allocation.type.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Original Balance:</span>
                                                        <span className="font-semibold">
                                                            ₱{(allocation.original_balance ?? allocation.current_balance ?? 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {allocation.is_taxable && ewtForThisPayable > 0 && (
                                                        <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                                            <span>EWT Withheld:</span>
                                                            <span className="font-semibold">₱{ewtForThisPayable.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Amount Allocated:</span>
                                                        <span className="font-semibold">
                                                            ₱{(allocation.cash_payment ?? allocation.amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-purple-200 pt-1 dark:border-purple-700">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {(allocation.remaining_balance ?? 0) <= 0.01 ? 'Status:' : 'Remaining Balance:'}
                                                        </span>
                                                        <span
                                                            className={
                                                                (allocation.remaining_balance ?? 0) <= 0.01
                                                                    ? 'font-semibold text-green-600 dark:text-green-400'
                                                                    : 'font-semibold text-yellow-600 dark:text-yellow-400'
                                                            }
                                                        >
                                                            {(allocation.remaining_balance ?? 0) <= 0.01
                                                                ? 'Fully Paid'
                                                                : `₱${(allocation.remaining_balance ?? 0).toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Allocation Summary */}
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                            <div className="mb-2 text-xs font-semibold text-blue-800 dark:text-blue-400">Payment Allocation Summary</div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Subtotal Before EWT:</span>
                                    <span className="font-semibold">₱{preview.subtotal_before_ewt.toFixed(2)}</span>
                                </div>
                                {preview.actual_ewt_amount > 0 && (
                                    <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                        <span>- EWT Withheld:</span>
                                        <span className="font-semibold">-₱{preview.actual_ewt_amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-blue-300 pt-1 dark:border-blue-600">
                                    <span>Subtotal After EWT:</span>
                                    <span className="font-semibold">₱{preview.subtotal_after_ewt.toFixed(2)}</span>
                                </div>
                                {preview.credit_applied > 0 && (
                                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                        <span>- Credit Applied:</span>
                                        <span className="font-semibold">-₱{preview.credit_applied.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-blue-300 pt-1 font-bold dark:border-blue-600">
                                    <span>Amount Needed:</span>
                                    <span>₱{preview.amount_needed_after_credit.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Result */}
                        <div className="rounded-lg border-2 p-3 dark:border-gray-600">
                            {preview.is_overpayment ? (
                                <div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="font-semibold">Change/Overpayment:</span>
                                        <span className="text-lg font-bold">₱{preview.change_or_balance.toFixed(2)}</span>
                                    </div>
                                    {preview.change_or_balance > 0 && (
                                        <div className="mt-1 text-xs text-green-700 dark:text-green-300">
                                            Will be added to customer's credit balance
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between text-red-600 dark:text-red-400">
                                        <span className="font-semibold">Balance Due:</span>
                                        <span className="text-lg font-bold">₱{preview.change_or_balance.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-red-700 dark:text-red-300">
                                        Partial payment - {preview.allocations.length} payable(s) will be paid/partially paid
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-gray-500">Loading payment preview...</div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-green-900 hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-700">
                        Confirm Payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
