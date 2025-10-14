import { useState } from 'react';
import Input from '@/components/composables/input';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Search, Info, Check, FileText, Calendar, MapPin, Hash, DollarSign, Layers, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TransactionDetail {
    id: number;
    bill_month: string;
    transaction_code?: string;
    total_amount?: string | number;
    quantity?: string | number;
    amount?: string | number;
}

interface TransactionRow {
    id: number;
    account_number: string;
    account_name: string;
    address: string;
    meter_number: string;
    meter_status: string;
    status?: string;
    total_amount?: string | number;
    or_date?: string;
    or_number?: string;
    cashier?: string;
    payment_mode?: string;
    payment_area?: string;
}

interface PageProps {
    search?: string;
    accounts?: TransactionRow[];
    latestTransaction?: TransactionRow;
    transactionDetails?: TransactionDetail[];
    subtotal?: number;
    qty?: number;
    bir2306?: number;
    bir2307?: number;
    [key: string]: unknown;
}

export default function TransactionsIndex() {
    const {
        latestTransaction,
        transactionDetails = [],
        subtotal = 0,
        qty = 0,
        bir2306 = 0,
        bir2307 = 0,
        search: lastSearch = '',
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState('');
    const [checkedBir2306, setCheckedBir2306] = useState(true);
    const [checkedBir2307, setCheckedBir2307] = useState(true);

    // Payment state
    const [paymentRows, setPaymentRows] = useState([
        { amount: '', mode: 'Cash' }
    ]);
    const [multiplePayment, setMultiplePayment] = useState(false);

    const paymentModes = ['Cash', 'Card', 'Check'];

    const handlePaymentChange = (idx: number, field: string, value: string) => {
        setPaymentRows(rows =>
            rows.map((row, i) =>
                i === idx ? { ...row, [field]: value } : row
            )
        );
    };

    const addPaymentRow = () => {
        setPaymentRows(rows => [...rows, { amount: '', mode: 'Cash' }]);
    };

    const removePaymentRow = (idx: number) => {
        setPaymentRows(rows => rows.filter((_, i) => i !== idx));
    };

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Handle search submit: clear search bar but keep result
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.get(route('transactions.index'), { search }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setSearch(''),
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Point of Payments', href: route('transactions.index') },
            ]}
        >
            <Head title="Point of Payments" />
            <div className="p-4 lg:p-6 w-full max-w-full flex flex-col gap-6">
                {/* Search Bar */}
                <div className="mb-2">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative w-full">
                            <Input
                                type="text"
                                placeholder="Search Acnt. Number / Acnt. Name / Meter No. . . ."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 pl-12 pr-12 text-base font-semibold"
                            />
                            <Search className="absolute top-3 left-4 h-5 w-5 text-green-900" />
                            {search && (
                                <button
                                    type="button"
                                    className="absolute top-3 right-12 flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                >
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center bg-green-900 rounded text-white hover:bg-green-700 transition"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Not found message */}
                {lastSearch && !latestTransaction && (
                    <div className="w-full bg-red-100 border border-red-300 text-red-700 rounded px-4 py-3 mb-4 text-center font-semibold">
                        No transaction found for "<span className="font-bold">{lastSearch}</span>"
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Account Details */}
                    <div className="flex-1">
                        {latestTransaction && (
                            <>
                                <AccountDetails
                                    latestTransaction={latestTransaction}
                                    transactionDetails={transactionDetails}
                                    subtotal={subtotal}
                                    qty={qty}
                                    bir2306={bir2306}
                                    bir2307={bir2307}
                                    checkedBir2306={checkedBir2306}
                                    checkedBir2307={checkedBir2307}
                                    setCheckedBir2306={setCheckedBir2306}
                                    setCheckedBir2307={setCheckedBir2307}
                                    onViewDetails={() => setIsDialogOpen(true)}
                                />
                                <TransactionDetailsDialog
                                    open={isDialogOpen}
                                    onOpenChange={setIsDialogOpen}
                                    transaction={latestTransaction}
                                />
                            </>
                        )}
                    </div>
                    {/* Right: Payment Card */}
                    {latestTransaction && (
                        <div className="w-full lg:w-[420px] flex flex-col gap-4">
                            <PaymentDetails
                                paymentRows={paymentRows}
                                setPaymentRows={setPaymentRows}
                                multiplePayment={multiplePayment}
                                setMultiplePayment={setMultiplePayment}
                                paymentModes={paymentModes}
                                handlePaymentChange={handlePaymentChange}
                                addPaymentRow={addPaymentRow}
                                removePaymentRow={removePaymentRow}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function getModelName(type?: string) {
    if (!type) return 'N/A';
    const parts = type.split(/\\|\./);
    let name = parts[parts.length - 1] || '';
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    return name.replace(/\b\w/g, (l) => l.toUpperCase());
}

function TransactionDetailsDialog({
    open,
    onOpenChange,
    transaction
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: TransactionRow | null;
}) {
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="z-[9999] mx-4 max-h-[90vh] max-w-lg overflow-y-auto sm:mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        Transaction Details
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        View detailed information about this transaction and its items.
                    </DialogDescription>
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
                                            <span className="font-mono font-medium break-all">
                                                {getModelName((transaction as any).transactionable_type)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                            <span className="font-medium text-gray-600">Account Name:</span>
                                            <span className="font-mono font-medium break-all">{transaction.account_name ? transaction.account_name : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-1">
                                            <span className="font-medium text-gray-600">Account No:</span>
                                            <span className="font-mono font-medium break-all">{transaction.account_number ? transaction.account_number : 'N/A'}</span>
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

function AccountDetails({
    latestTransaction,
    transactionDetails,
    subtotal,
    qty,
    checkedBir2306,
    checkedBir2307,
    setCheckedBir2306,
    setCheckedBir2307,
    onViewDetails,
}: {
    latestTransaction: TransactionRow;
    transactionDetails: TransactionDetail[];
    subtotal: number;
    qty: number;
    bir2306: number;
    bir2307: number;
    checkedBir2306: boolean;
    checkedBir2307: boolean;
    setCheckedBir2306: (v: boolean) => void;
    setCheckedBir2307: (v: boolean) => void;
    onViewDetails: () => void;
}) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="font-semibold text-base mb-2 border-b pb-2">Account Details</div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2 mt-2">
                    <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Account No</div>
                        <Input
                            value={latestTransaction.account_number || 'N/A'}
                            readOnly
                            className="bg-green-900 text-white font-bold"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Meter No</div>
                        <Input
                            value={latestTransaction.meter_number || 'N/A'}
                            readOnly
                            className="bg-green-100 text-green-900 font-bold"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Meter Status</div>
                        <Input
                            value={latestTransaction.meter_status || 'N/A'}
                            readOnly
                            className="bg-green-100 text-green-900 font-bold"
                        />
                    </div>
                    <div className="flex items-end justify-end">
                        <div>
                            <Button
                                className="h-10 w-full bg-green-900 text-white font-bold flex items-center justify-center p-2 hover:bg-green-700 transition"
                                variant="default"
                                size="icon"
                                title="Details"
                                onClick={onViewDetails}
                            >
                                <Info className="w-5 h-5 mr-2" />
                                <span className="text-base font-semibold">View Details</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Account Name</div>
                    <div className="bg-green-100 text-green-900 font-bold px-2 py-1 rounded">
                        {latestTransaction.account_name || 'N/A'}
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Address</div>
                    <div className="bg-green-100 text-green-900 font-bold px-2 py-1 rounded">
                        {latestTransaction.address || 'N/A'}
                    </div>
                </div>

                {/* Bill Table with Check Icon */}
                <div className="mt-6 border border-green-900 rounded">
                    <div className="bg-green-900 text-white font-bold px-2 py-1 rounded-t flex items-center">
                        <span>Bill Month</span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 bg-green-50"></TableHead>
                                <TableHead className="bg-green-50">Bill Month</TableHead>
                                <TableHead className="bg-green-50">Item Name</TableHead>
                                <TableHead className="bg-green-50 text-right">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionDetails && transactionDetails.length > 0 ? (
                                transactionDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                        <TableCell>
                                            <Check className="text-green-600 w-5 h-5 mx-auto" />
                                        </TableCell>
                                        <TableCell>{detail.bill_month}</TableCell>
                                        <TableCell>{detail.transaction_code}</TableCell>
                                        <TableCell className="text-right">
                                            {Number(detail.total_amount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                        No bill details found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* BIR Forms Checklist */}
                <div className="flex gap-2 mt-4">
                    <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded border border-green-200 cursor-pointer">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2306}
                            onChange={e => setCheckedBir2306(e.target.checked)}
                        />
                        <span className="text-green-900 font-semibold">BIR Form No.2306 (FT)</span>
                        <span className="ml-2 text-green-700 font-bold">
                            {checkedBir2306}
                        </span>
                    </label>
                    <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded border border-green-200 cursor-pointer">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2307}
                            onChange={e => setCheckedBir2307(e.target.checked)}
                        />
                        <span className="text-green-900 font-semibold">BIR Form No.2307 (EWT)</span>
                        <span className="ml-2 text-green-700 font-bold">
                            {checkedBir2307}
                        </span>
                    </label>
                </div>

                {/* QTY, Subtotal, FT, EWT */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-green-100 text-green-900 rounded p-3 flex flex-col items-center">
                        <div className="text-xs">QTY</div>
                        <div className="text-2xl font-bold">{qty}</div>
                    </div>
                    <div className="bg-green-100 text-green-900 rounded p-3 flex flex-col items-center">
                        <div className="text-xs">Sub Total</div>
                        <div className="text-2xl font-bold">{Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-green-50 text-green-900 rounded p-3 flex flex-col items-center border border-green-200">
                        <div className="text-xs">FT</div>
                        <div className="text-lg font-bold">
                            {latestTransaction.ft ? latestTransaction.ft : '0.00'}
                        </div>
                    </div>
                    <div className="bg-green-50 text-green-900 rounded p-3 flex flex-col items-center border border-green-200">
                        <div className="text-xs">EWT</div>
                        <div className="text-lg font-bold">
                            {latestTransaction.ewt ? latestTransaction.ewt : '0.00'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function PaymentDetails({
    paymentRows,
    setPaymentRows,
    multiplePayment,
    setMultiplePayment,
    paymentModes,
    handlePaymentChange,
    addPaymentRow,
    removePaymentRow,
}: {
    paymentRows: { amount: string; mode: string }[];
    setPaymentRows: React.Dispatch<React.SetStateAction<{ amount: string; mode: string }[]>>;
    multiplePayment: boolean;
    setMultiplePayment: (v: boolean) => void;
    paymentModes: string[];
    handlePaymentChange: (idx: number, field: string, value: string) => void;
    addPaymentRow: () => void;
    removePaymentRow: (idx: number) => void;
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="font-semibold text-base mb-4 border-b pb-2">Payment</div>
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium">Multiple Payment</label>
                        <input
                            type="checkbox"
                            checked={multiplePayment}
                            onChange={e => setMultiplePayment(e.target.checked)}
                            className="accent-green-600"
                        />
                    </div>
                    {paymentRows.map((row, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={row.amount}
                                onChange={e => handlePaymentChange(idx, 'amount', e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={row.mode}
                                onChange={e => handlePaymentChange(idx, 'mode', e.target.value)}
                                className="border rounded px-2 py-2 text-sm"
                            >
                                {paymentModes.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                            {multiplePayment && paymentRows.length > 1 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removePaymentRow(idx)}
                                    className="text-red-500"
                                >
                                    &times;
                                </Button>
                            )}
                        </div>
                    ))}
                    {multiplePayment && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={addPaymentRow}
                        >
                            + Add Payment
                        </Button>
                    )}
                </div>
                <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">No. of Transactions</div>
                    <Input value={paymentRows.length} readOnly className="bg-green-100 text-green-900 font-bold" />
                </div>
                <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Other Details</div>
                    <Input placeholder="Settlement, Notes, etc." />
                </div>
                {/* Checklist */}
                <div className="mb-4">
                    <div className="font-semibold mb-2">Checklist</div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600" />
                            <span className="text-sm">Check, if payment is for settlement</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-green-600" />
                            <span className="text-sm">Multiple Items</span>
                        </label>
                    </div>
                </div>
                <Button className="w-full bg-green-900 text-white font-bold text-lg">
                    SETTLE
                </Button>
            </CardContent>
        </Card>
    );
}