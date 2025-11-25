import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PayableDefinition } from '@/types/transactions';
import { AlertCircle, CheckCircle2, Clock, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PayableDefinitionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payableId: number | null;
    payableName: string;
}

interface PayableDetailsResponse {
    payable: {
        id: number;
        customer_payable: string;
        total_amount_due: number;
        amount_paid: number;
        balance: number;
        status: string;
    };
    definitions: PayableDefinition[];
}

export default function PayableDefinitionsDialog({ open, onOpenChange, payableId, payableName }: PayableDefinitionsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [payableDetails, setPayableDetails] = useState<PayableDetailsResponse | null>(null);

    const fetchPayableDefinitions = useCallback(async () => {
        if (!payableId) return;

        setLoading(true);
        try {
            const response = await fetch(route('transactions.payable-definitions', payableId));

            if (!response.ok) {
                throw new Error('Failed to fetch payable definitions');
            }

            const data: PayableDetailsResponse = await response.json();
            setPayableDetails(data);
        } catch (error) {
            console.error('Error fetching payable definitions:', error);
            toast.error('Failed to load payable details');
        } finally {
            setLoading(false);
        }
    }, [payableId]);

    useEffect(() => {
        if (open && payableId) {
            fetchPayableDefinitions();
        }
    }, [open, payableId, fetchPayableDefinitions]);

    const handleClose = () => {
        onOpenChange(false);
        setPayableDetails(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'partially_paid':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-red-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'partially_paid':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            default:
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] w-full !max-w-[65vw] overflow-y-auto">
                <DialogHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{payableName}</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">Detailed breakdown of charges and fees</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="space-y-4 text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Details</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch the payable information...</p>
                            </div>
                        </div>
                    </div>
                ) : payableDetails ? (
                    <div className="space-y-6">
                        {/* Payment Summary - Single Row Layout */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Total Amount */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount Due</div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        ₱
                                        {Number(payableDetails.payable.total_amount_due).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Amount Paid */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Paid</div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        ₱
                                        {Number(payableDetails.payable.amount_paid).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Outstanding Balance */}
                            <Card className="border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding Balance</div>
                                    </div>
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        ₱
                                        {Number(payableDetails.payable.balance).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status Badge - Separate and Prominent */}
                        <div className="flex items-center justify-between px-1">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Payment Status</div>
                            <Badge className={`${getStatusColor(payableDetails.payable.status)} border-0 px-4 py-2 text-sm font-semibold`}>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(payableDetails.payable.status)}
                                    <span>{payableDetails.payable.status.replace('_', ' ').toUpperCase()}</span>
                                </div>
                            </Badge>
                        </div>

                        <Separator />

                        {/* Definitions Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Line Items</h3>
                                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                                    {payableDetails.definitions.length} {payableDetails.definitions.length === 1 ? 'item' : 'items'}
                                </Badge>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-900/50 dark:hover:bg-gray-900/50">
                                            <TableHead className="w-[35%] font-semibold text-gray-700 dark:text-gray-300">Description</TableHead>
                                            <TableHead className="w-[15%] font-semibold text-gray-700 dark:text-gray-300">Code</TableHead>
                                            <TableHead className="w-[10%] text-center font-semibold text-gray-700 dark:text-gray-300">Qty</TableHead>
                                            <TableHead className="w-[10%] text-center font-semibold text-gray-700 dark:text-gray-300">Unit</TableHead>
                                            <TableHead className="w-[15%] text-right font-semibold text-gray-700 dark:text-gray-300">
                                                Unit Price
                                            </TableHead>
                                            <TableHead className="w-[15%] text-right font-semibold text-gray-700 dark:text-gray-300">
                                                Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payableDetails.definitions.map((definition, index) => (
                                            <TableRow
                                                key={definition.id}
                                                className={` ${index % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/20'} transition-colors hover:bg-gray-100 dark:hover:bg-gray-900/40`}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {definition.transaction_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(definition.billing_month).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                        {definition.transaction_code}
                                                    </code>
                                                </TableCell>
                                                <TableCell className="py-4 text-center font-medium text-gray-900 dark:text-gray-100">
                                                    {definition.quantity}
                                                </TableCell>
                                                <TableCell className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                                    {definition.unit || 'item'}
                                                </TableCell>
                                                <TableCell className="py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                                                    ₱
                                                    {Number(definition.amount).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                        ₱
                                                        {Number(definition.total_amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Total Summary */}
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-base font-semibold text-gray-700 dark:text-gray-300">Total Amount</div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ₱
                                            {Number(payableDetails.payable.total_amount_due).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No Details Available</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unable to load payable information</p>
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={handleClose} variant="outline" size="lg" className="px-8 font-medium">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
