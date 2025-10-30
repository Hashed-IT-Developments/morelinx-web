import AccountDetails from '@/components/transactions/account-details';
// import CashierInfoCard, { CashierInfoCardRef } from '@/components/transactions/cashier-info-card';
import PayableDefinitionsDialog from '@/components/transactions/payable-definitions-dialog';
import PaymentDetails from '@/components/transactions/payment-details';
import PaymentQueueDialog from '@/components/transactions/payment-queue-dialog';
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
        ewtRates = { government: 0.025, commercial: 0.05 }, // Fallback to default rates
        flash,
        transaction,
        next_or, // OR offset to pre-populate after transaction
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState(lastSearch);

    // Ref for CashierInfoCard to trigger refresh
    // const cashierInfoRef = useRef<CashierInfoCardRef>(null);

    // Selected payables state (for choosing which payables to pay)
    const [selectedPayables, setSelectedPayables] = useState<number[]>([]);

    // EWT type state (government 2.5% or commercial 5%)
    const [selectedEwtType, setSelectedEwtType] = useState<'government' | 'commercial' | null>(null);

    // Calculate subtotal based on selected payables, separating taxable and non-taxable
    const selectedPayablesCalculation = transactionDetails
        .filter((detail) => selectedPayables.includes(detail.id))
        .reduce(
            (acc, detail) => {
                const balance = Number(detail.balance || 0);
                const isSubjectToEwt = detail.is_subject_to_ewt ?? false;

                if (isSubjectToEwt) {
                    acc.taxableSubtotal += balance;
                } else {
                    acc.nonTaxableSubtotal += balance;
                }
                acc.totalSubtotal += balance;

                return acc;
            },
            { taxableSubtotal: 0, nonTaxableSubtotal: 0, totalSubtotal: 0 },
        );

    // Calculate EWT amount based on selected type
    const calculatedEwt = selectedEwtType ? selectedPayablesCalculation.taxableSubtotal * ewtRates[selectedEwtType] : 0;

    // Final subtotal after EWT deduction
    const selectedPayablesSubtotal = selectedPayablesCalculation.totalSubtotal - calculatedEwt;

    // Payment state
    const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([{ amount: '', mode: 'cash' }]);

    // Reset selected payables when customer changes
    useEffect(() => {
        // Auto-select all payables when a new customer is loaded
        if (latestTransaction && transactionDetails.length > 0) {
            const allPayableIds = transactionDetails.map((detail) => detail.id);
            setSelectedPayables(allPayableIds);
        } else {
            setSelectedPayables([]);
        }
        setSelectedEwtType(null);

        // Reset payment rows to initial state when customer changes
        setPaymentRows([{ amount: '', mode: 'cash' }]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestTransaction?.id]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            if (transaction?.or_number) {
                toast.success(`Payment Successful! OR Number: ${transaction.or_number}`, {
                    description: `Total amount: ₱${transaction.total_amount?.toLocaleString() || '0.00'}`,
                    duration: 6000,
                });
                // Refresh cashier info after successful payment (with small delay to ensure DB is updated)
                // setTimeout(() => {
                //     cashierInfoRef.current?.refresh();
                // }, 100);
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
    const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
    const [selectedPayableId, setSelectedPayableId] = useState<number | null>(null);
    const [selectedPayableName, setSelectedPayableName] = useState<string>('');

    // Handle payable definitions dialog
    const handleViewPayableDefinitions = (payableId: number, payableName: string) => {
        setSelectedPayableId(payableId);
        setSelectedPayableName(payableName);
        setIsPayableDialogOpen(true);
    };

    // Handle search submit: keep search term in the input
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            searchForCustomer(search);
        }
    };

    const handleSearchClear = () => setSearch('');

    // Shared function to search for a customer
    const searchForCustomer = (searchTerm: string, showNotFoundError: boolean = true) => {
        router.get(
            route('transactions.index'),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const { latestTransaction } = page.props as PageProps;
                    if (latestTransaction) {
                        toast.success(`Customer found: ${latestTransaction.account_name}`);
                    } else if (showNotFoundError) {
                        toast.error(`No customer found for: ${searchTerm}`);
                    }
                },
                onError: () => {
                    if (showNotFoundError) {
                        toast.error('An error occurred while searching for the customer');
                    }
                },
            },
        );
    };

    const handleSelectFromQueue = (accountNumber: string) => {
        setSearch(accountNumber);
        searchForCustomer(accountNumber, false);
    };

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
                {/* Cashier Info Card */}
                {/* <CashierInfoCard ref={cashierInfoRef} /> */}

                {/* Search Bar */}
                <SearchBar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onSearchClear={handleSearchClear}
                    onOpenQueue={() => setIsQueueDialogOpen(true)}
                />

                {/* Payment Queue Dialog */}
                <PaymentQueueDialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen} onSelectCustomer={handleSelectFromQueue} />

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
                                    onViewDetails={() => setIsDialogOpen(true)}
                                    onViewPayableDefinitions={handleViewPayableDefinitions}
                                    selectedPayables={selectedPayables}
                                    onSelectedPayablesChange={setSelectedPayables}
                                    selectedEwtType={selectedEwtType}
                                    onEwtTypeChange={setSelectedEwtType}
                                    ewtRates={ewtRates}
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
                                customerAccountId={latestTransaction.id}
                                philippineBanks={philippineBanks}
                                selectedPayableIds={selectedPayables}
                                availableCreditBalance={
                                    latestTransaction.credit_balance != null ? Number(latestTransaction.credit_balance) : undefined
                                }
                                ewtAmount={calculatedEwt}
                                ewtType={selectedEwtType}
                                subtotalBeforeEwt={selectedPayablesCalculation.totalSubtotal}
                                ewtRates={ewtRates}
                                initialOffset={next_or ? Number(next_or) : null}
                                onPaymentSuccess={() => {
                                    // Refresh cashier info immediately after successful payment
                                    // setTimeout(() => {
                                    //     cashierInfoRef.current?.refresh();
                                    // }, 100);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
