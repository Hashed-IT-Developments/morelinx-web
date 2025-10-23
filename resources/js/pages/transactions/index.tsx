import AccountDetails from '@/components/transactions/account-details';
import PayableDefinitionsDialog from '@/components/transactions/payable-definitions-dialog';
import PaymentDetails from '@/components/transactions/payment-details';
import SearchBar from '@/components/transactions/search-bar';
import TransactionDetailsDialog from '@/components/transactions/transaction-details-dialog';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaymentRow } from '@/types/transactions';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

export default function TransactionsIndex() {
    const {
        latestTransaction,
        transactionDetails = [],
        subtotal = 0,
        qty = 0,
        search: lastSearch = '',
        philippineBanks = [],
        flash,
        transaction,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(lastSearch);
    const [checkedBir2306, setCheckedBir2306] = useState(true);
    const [checkedBir2307, setCheckedBir2307] = useState(true);

    // Selected payables state (for choosing which payables to pay)
    const [selectedPayables, setSelectedPayables] = useState<number[]>([]);

    // Calculate subtotal based on selected payables only
    const selectedPayablesSubtotal = transactionDetails
        .filter((detail) => selectedPayables.includes(detail.id))
        .reduce((sum, detail) => {
            const balance = Number(detail.balance || 0);
            return sum + balance;
        }, 0);

    // Payment state
    const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([{ amount: '', mode: 'cash' }]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            if (transaction?.or_number) {
                toast.success(`Payment Successful! OR Number: ${transaction.or_number}`, {
                    description: `Total amount: ₱${transaction.total_amount?.toLocaleString() || '0.00'}`,
                    duration: 6000,
                });
            } else {
                toast.success(flash.success, {
                    duration: 5000,
                });
            }
        }
        if (flash?.error) {
            toast.error('Payment Failed', {
                description: flash.error,
                duration: 6000,
            });
        }
        if (flash?.warning) {
            toast.warning(flash.warning, {
                duration: 5000,
            });
        }
        if (flash?.info) {
            toast.info(flash.info, {
                duration: 4000,
            });
        }
    }, [flash, transaction]);

    const handlePaymentChange = (idx: number, field: string, value: string) => {
        setPaymentRows((rows) => rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
    };

    const addPaymentRow = () => {
        // Additional payment rows default to 'credit_card' since Cash is not allowed for additional payments
        setPaymentRows((rows) => [...rows, { amount: '', mode: 'credit_card' }]);
    };

    const removePaymentRow = (idx: number) => {
        setPaymentRows((rows) => rows.filter((_, i) => i !== idx));
    };

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPayableDialogOpen, setIsPayableDialogOpen] = useState(false);
    const [selectedPayableId, setSelectedPayableId] = useState<number | null>(null);
    const [selectedPayableName, setSelectedPayableName] = useState<string>('');

    // Handle payable definitions dialog
    const handleViewPayableDefinitions = (payableId: number, payableName: string) => {
        setSelectedPayableId(payableId);
        setSelectedPayableName(payableName);
        setIsPayableDialogOpen(true);
    };

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
                    onSuccess: (page) => {
                        setSearch('');
                        const { latestTransaction } = page.props as PageProps;
                        if (latestTransaction) {
                            toast.success(`Customer found: ${latestTransaction.account_name}`);
                        } else {
                            toast.error(`No customer found for account number: ${search}`);
                        }
                    },
                    onError: () => {
                        toast.error('An error occurred while searching for the customer');
                    },
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
            <Toaster position="top-right" richColors />
            <div className="flex w-full max-w-full flex-col gap-6 p-4 lg:p-6">
                {/* Search Bar */}
                <SearchBar search={search} onSearchChange={setSearch} onSearchSubmit={handleSearchSubmit} onSearchClear={handleSearchClear} />

                {/* Empty state - no search performed yet */}
                {!lastSearch && !latestTransaction && (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/20">
                        <svg
                            className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">No Customer Selected</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Search for a customer by account number to view transactions and process payments
                        </p>
                    </div>
                )}

                {/* Not found message */}
                {lastSearch && !latestTransaction && (
                    <div className="mb-4 w-full rounded border border-red-300 bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
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
                                    onViewPayableDefinitions={handleViewPayableDefinitions}
                                    selectedPayables={selectedPayables}
                                    onSelectedPayablesChange={setSelectedPayables}
                                />
                                <TransactionDetailsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} transaction={latestTransaction} />
                                <PayableDefinitionsDialog
                                    open={isPayableDialogOpen}
                                    onOpenChange={setIsPayableDialogOpen}
                                    payableId={selectedPayableId}
                                    payableName={selectedPayableName}
                                />
                            </>
                        )}
                    </div>
                    {/* Right: Payment Card */}
                    {latestTransaction && (
                        <div className="flex w-full flex-col gap-4 lg:w-[420px]">
                            <PaymentDetails
                                paymentRows={paymentRows}
                                handlePaymentChange={handlePaymentChange}
                                addPaymentRow={addPaymentRow}
                                removePaymentRow={removePaymentRow}
                                subtotal={selectedPayablesSubtotal}
                                customerApplicationId={latestTransaction.id}
                                philippineBanks={philippineBanks}
                                selectedPayableIds={selectedPayables}
                                availableCreditBalance={
                                    latestTransaction.credit_balance != null ? Number(latestTransaction.credit_balance) : undefined
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
