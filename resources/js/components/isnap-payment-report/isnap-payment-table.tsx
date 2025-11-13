import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IsnapPayment } from '../../types/isnap-payment-types';

interface IsnapPaymentTableProps {
    payments: IsnapPayment[];
    onRowClick: (payment: IsnapPayment) => void;
}

export function IsnapPaymentTable({ payments, onRowClick }: IsnapPaymentTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Account Number</TableHead>
                        <TableHead className="text-xs">Customer Name</TableHead>
                        <TableHead className="text-xs">Rate Class</TableHead>
                        <TableHead className="text-xs">Town</TableHead>
                        <TableHead className="text-xs">Barangay</TableHead>
                        <TableHead className="text-xs text-right">Paid Amount</TableHead>
                        <TableHead className="text-xs">Date Paid</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                No ISNAP payment records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        payments.map((payment) => (
                            <TableRow key={payment.id} onClick={() => onRowClick(payment)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="text-xs">{payment.account_number}</TableCell>
                                <TableCell className="text-xs">{payment.customer_name}</TableCell>
                                <TableCell className="text-xs">{payment.rate_class}</TableCell>
                                <TableCell className="text-xs">{payment.town}</TableCell>
                                <TableCell className="text-xs">{payment.barangay}</TableCell>
                                <TableCell className="text-xs text-right font-medium">{formatCurrency(payment.paid_amount)}</TableCell>
                                <TableCell className="text-xs">{payment.date_paid}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
