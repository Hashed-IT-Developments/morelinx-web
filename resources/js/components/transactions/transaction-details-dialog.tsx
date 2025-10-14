import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionRow } from '@/types/transactions';
import { FileText, Hash, Info, Layers, MapPin } from 'lucide-react';

interface TransactionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: TransactionRow | null;
}

function getModelName(type?: string) {
    if (!type) return 'N/A';
    const parts = type.split(/\\|\./);
    let name = parts[parts.length - 1] || '';
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    return name.replace(/\b\w/g, (l) => l.toUpperCase());
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
                                            <span className="font-medium text-gray-600">Transactionable Type:</span>
                                            <span className="font-mono font-medium break-all">{getModelName(transaction.transactionable_type)}</span>
                                        </div>
                                    </div>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
