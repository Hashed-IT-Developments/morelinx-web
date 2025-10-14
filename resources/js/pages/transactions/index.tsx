import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, FileText, Hash, Info, Layers, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

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
    const [paymentRows, setPaymentRows] = useState([{ amount: '', mode: 'Cash' }]);
    const [multiplePayment, setMultiplePayment] = useState(false);

    const paymentModes = ['Cash', 'Card', 'Check'];

    const handlePaymentChange = (idx: number, field: string, value: string) => {
        setPaymentRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
    };

    const addPaymentRow = () => {
        setPaymentRows((rows) => [...rows, { amount: '', mode: 'Cash' }]);
    };

    const removePaymentRow = (idx: number) => {
        setPaymentRows((rows) => rows.filter((_, i) => i !== idx));
    };

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Handle search submit: clear search bar but keep result
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.get(
                route('transactions.index'),
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => setSearch(''),
                },
            );
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
            <div className="flex w-full max-w-full flex-col gap-6 p-4 lg:p-6">
                {/* Search Bar */}
                <div className="mb-2">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative w-full">
                            <Input
                                type="text"
                                placeholder="Search Acnt. Number / Acnt. Name / Meter No. . . ."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 pr-12 pl-12 text-base font-semibold"
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
                                className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded bg-green-900 text-white transition hover:bg-green-700"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Not found message */}
                {lastSearch && !latestTransaction && (
                    <div className="mb-4 w-full rounded border border-red-300 bg-red-100 px-4 py-3 text-center font-semibold text-red-700">
                        No transaction found for "<span className="font-bold">{lastSearch}</span>"
                    </div>
                )}

                <div className="flex flex-col gap-6 lg:flex-row">
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
                                <TransactionDetailsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} transaction={latestTransaction} />
                            </>
                        )}
                    </div>
                    {/* Right: Payment Card */}
                    {latestTransaction && (
                        <div className="flex w-full flex-col gap-4 lg:w-[420px]">
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
    transaction,
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
                                            <span className="font-mono font-medium break-all">
                                                {getModelName((transaction as any).transactionable_type)}
                                            </span>
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
                <div className="mb-2 border-b pb-2 text-base font-semibold">Account Details</div>
                <div className="mt-2 mb-2 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <div className="mb-1 text-xs text-gray-500">Account No</div>
                        <Input value={latestTransaction.account_number || 'N/A'} readOnly className="bg-green-900 font-bold text-white" />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500">Meter No</div>
                        <Input value={latestTransaction.meter_number || 'N/A'} readOnly className="bg-green-100 font-bold text-green-900" />
                    </div>
                    <div>
                        <div className="mb-1 text-xs text-gray-500">Meter Status</div>
                        <Input value={latestTransaction.meter_status || 'N/A'} readOnly className="bg-green-100 font-bold text-green-900" />
                    </div>
                    <div className="flex items-end justify-end">
                        <div>
                            <Button
                                className="flex h-10 w-full items-center justify-center bg-green-900 p-2 font-bold text-white transition hover:bg-green-700"
                                variant="default"
                                size="icon"
                                title="Details"
                                onClick={onViewDetails}
                            >
                                <Info className="mr-2 h-5 w-5" />
                                <span className="text-base font-semibold">View Details</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="mb-1 text-xs text-gray-500">Account Name</div>
                    <div className="rounded bg-green-100 px-2 py-1 font-bold text-green-900">{latestTransaction.account_name || 'N/A'}</div>
                </div>
                <div className="mt-2">
                    <div className="mb-1 text-xs text-gray-500">Address</div>
                    <div className="rounded bg-green-100 px-2 py-1 font-bold text-green-900">{latestTransaction.address || 'N/A'}</div>
                </div>

                {/* Bill Table with Check Icon */}
                <div className="mt-6 rounded border border-green-900">
                    <div className="flex items-center rounded-t bg-green-900 px-2 py-1 font-bold text-white">
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
                                            <Check className="mx-auto h-5 w-5 text-green-600" />
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
                <div className="mt-4 flex gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2306}
                            onChange={(e) => setCheckedBir2306(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900">BIR Form No.2306 (FT)</span>
                        <span className="ml-2 font-bold text-green-700">{checkedBir2306}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                        <input
                            type="checkbox"
                            className="accent-green-600"
                            checked={checkedBir2307}
                            onChange={(e) => setCheckedBir2307(e.target.checked)}
                        />
                        <span className="font-semibold text-green-900">BIR Form No.2307 (EWT)</span>
                        <span className="ml-2 font-bold text-green-700">{checkedBir2307}</span>
                    </label>
                </div>

                {/* QTY, Subtotal, FT, EWT */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900">
                        <div className="text-xs">QTY</div>
                        <div className="text-2xl font-bold">{qty}</div>
                    </div>
                    <div className="flex flex-col items-center rounded bg-green-100 p-3 text-green-900">
                        <div className="text-xs">Sub Total</div>
                        <div className="text-2xl font-bold">{Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900">
                        <div className="text-xs">FT</div>
                        <div className="text-lg font-bold">{latestTransaction.ft ? latestTransaction.ft : '0.00'}</div>
                    </div>
                    <div className="flex flex-col items-center rounded border border-green-200 bg-green-50 p-3 text-green-900">
                        <div className="text-xs">EWT</div>
                        <div className="text-lg font-bold">{latestTransaction.ewt ? latestTransaction.ewt : '0.00'}</div>
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
                <div className="mb-4 border-b pb-2 text-base font-semibold">Payment</div>
                <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                        <label className="text-sm font-medium">Multiple Payment</label>
                        <input
                            type="checkbox"
                            checked={multiplePayment}
                            onChange={(e) => setMultiplePayment(e.target.checked)}
                            className="accent-green-600"
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
                                className="rounded border px-2 py-2 text-sm"
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
                    <div className="mb-1 text-xs text-gray-500">No. of Transactions</div>
                    <Input value={paymentRows.length} readOnly className="bg-green-100 font-bold text-green-900" />
                </div>
                <div className="mb-4">
                    <div className="mb-1 text-xs text-gray-500">Other Details</div>
                    <Input placeholder="Settlement, Notes, etc." />
                </div>
                {/* Checklist */}
                <div className="mb-4">
                    <div className="mb-2 font-semibold">Checklist</div>
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
                <Button className="w-full bg-green-900 text-lg font-bold text-white">SETTLE</Button>
            </CardContent>
        </Card>
    );
}
