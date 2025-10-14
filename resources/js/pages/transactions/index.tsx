import AccountDetails from '@/components/transactions/account-details';
import PaymentDetails from '@/components/transactions/payment-details';
import SearchBar from '@/components/transactions/search-bar';
import TransactionDetailsDialog from '@/components/transactions/transaction-details-dialog';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types/transactions';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function TransactionsIndex() {
    const { latestTransaction, transactionDetails = [], subtotal = 0, qty = 0, search: lastSearch = '' } = usePage<PageProps>().props;

    const [search, setSearch] = useState(lastSearch);
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

    const handleSearchClear = () => setSearch('');

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
                <SearchBar search={search} onSearchChange={setSearch} onSearchSubmit={handleSearchSubmit} onSearchClear={handleSearchClear} />

                {/* Not found message */}
                {lastSearch && !latestTransaction && (
                    <div className="mb-4 w-full rounded border border-red-300 bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-700">
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
                                multiplePayment={multiplePayment}
                                setMultiplePayment={setMultiplePayment}
                                paymentModes={paymentModes}
                                handlePaymentChange={handlePaymentChange}
                                addPaymentRow={addPaymentRow}
                                removePaymentRow={removePaymentRow}
                                subtotal={subtotal}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
