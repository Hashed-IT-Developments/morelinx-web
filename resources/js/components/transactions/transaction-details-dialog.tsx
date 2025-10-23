import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionRow } from '@/types/transactions';
import { FileText, Hash, Info, Layers, MapPin } from 'lucide-react';

interface TransactionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: TransactionRow | null;
}

export default function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="z-[9999] mx-4 max-h-[90vh] max-w-lg overflow-y-auto sm:mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        Transaction Details
                    </DialogTitle>
                    <DialogDescription className="text-sm">View detailed information about this transaction and its items.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4">
                    {/* Transaction Information */}
                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                            <span className="font-medium text-gray-600">Account Name:</span>
                                            <span className="font-mono font-medium break-all">
                                                {transaction.account_name ? transaction.account_name : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                            <span className="font-medium text-gray-600">Account No:</span>
                                            <span className="font-mono font-medium break-all">
                                                {transaction.account_number ? transaction.account_number : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                            <span className="font-medium text-gray-600">Address:</span>
                                            <span className="break-words">{transaction.address ? transaction.address : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Layers className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                <span className="font-medium text-gray-600">Meter No:</span>
                                                <span className="font-mono font-medium break-all">{transaction.meter_number}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                                <span className="font-medium text-gray-600">Meter Status:</span>
                                                <span className="break-all">{transaction.meter_status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Balance */}
                    {Number(transaction.credit_balance || 0) > 0 && (
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col items-center space-y-2 rounded border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/20">
                                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-400">Available Credit Balance</div>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        ₱{Number(transaction.credit_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">Can be applied to payments</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
