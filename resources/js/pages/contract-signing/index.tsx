import ApplicationSummaryDialog from '@/components/application-summary-dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye, FileEdit, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PaginatedTable, { ColumnDefinition, SortConfig } from '@/components/ui/paginated-table';
import moment from 'moment';
import SigningDialog from './signing-dialog';

// --- Type Declarations ---
interface FileSystemDirectoryHandle {
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
}

interface ShowDirectoryPickerOptions {
    mode?: 'read' | 'readwrite';
}

interface ShowSaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

declare global {
    interface Window {
        showDirectoryPicker?(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
        showSaveFilePicker?(options?: ShowSaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }
}

// --- Interfaces ---
interface Auth {
    user: object;
    permissions: Array<string>;
}

interface PageProps {
    auth: Auth;
    applications: PaginatedApplications;
    search?: string;
    currentSort?: {
        field?: string;
        direction?: 'asc' | 'desc';
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

export default function ContractSigning() {
    const { applications, search: initialSearch, currentSort: backendSort, flash, errors } = usePage<PageProps>().props;
    // const { getStatusLabel, getStatusColor } = useStatusUtils();

    const [search, setSearch] = useState(initialSearch || '');
    const [currentSort, setCurrentSort] = useState<SortConfig>(backendSort || {});
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);
    const [showSigningDialog, setShowSigningDialog] = useState(false);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (errors?.message) {
            toast.error(errors.message);
        }
    }, [flash, errors]);

    // Debounced search
    const debouncedSearch = useCallback((searchTerm: string) => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;

        router.get(route('applications.contract-signing'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, debouncedSearch]);

    // Handle row click to show application summary
    const handleRowClick = (row: Record<string, unknown>) => {
        const application = row as unknown as CustomerApplication;
        setSelectedApplicationId(application.id);
        setSummaryDialogOpen(true);
    };

    // Handle sorting
    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const params: Record<string, string> = {};
        if (search) params.search = search;
        params.sort = field;
        params.direction = direction;

        router.get(route('applications.contract-signing'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSignClick = (e: React.MouseEvent, custApp: CustomerApplication) => {
        e.stopPropagation();

        setSelectedApplication(custApp);
        setShowSigningDialog(true);

        // (async () => {
        //     try {
        //         const pdfUrl = `${window.location.origin}/customer-applications/contract/pdf/application/${custApp.id}`;
        //         const res = await fetch(pdfUrl, { credentials: 'include', headers: { Accept: 'application/pdf' } });
        //         if (!res.ok) throw new Error('Failed to download PDF');
        //         const blob = await res.blob();

        //         // Try saving directly to a user-chosen folder (best effort)
        //         if ('showDirectoryPicker' in window && window.showDirectoryPicker) {
        //             const dirHandle = await window.showDirectoryPicker();
        //             const fileHandle = await dirHandle.getFileHandle('for_signing.pdf', { create: true });
        //             const writable = await fileHandle.createWritable();
        //             await writable.write(blob);
        //             await writable.close();
        //             toast.success('PDF saved as for_signing.pdf');
        //             return;
        //         }

        //         // Fallback: prompt user with Save As dialog
        //         if ('showSaveFilePicker' in window && window.showSaveFilePicker) {
        //             const fileHandle = await window.showSaveFilePicker({
        //                 suggestedName: 'for_signing.pdf',
        //                 types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
        //             });
        //             const writable = await fileHandle.createWritable();
        //             await writable.write(blob);
        //             await writable.close();
        //             toast.success('PDF saved');
        //             return;
        //         }

        //         // Last fallback: trigger browser download
        //         const objectUrl = URL.createObjectURL(blob);
        //         const a = document.createElement('a');
        //         a.href = objectUrl;
        //         a.download = 'for_signing.pdf';
        //         document.body.appendChild(a);
        //         a.click();
        //         a.remove();
        //         URL.revokeObjectURL(objectUrl);
        //         toast.success('PDF download started');
        //     } catch (err) {
        //         console.error(err);
        //         toast.error('Unable to download PDF');
        //     }
        // })();

        // // Open the contract signer after download completes
        // setTimeout(() => {
        //     const url = 'pdoc://';
        //     const win = window.open(url, '_blank');
        //     if (!win) {
        //         toast.error('Unable to open contract signer. Please allow pop-ups.');
        //     }
        // }, 1000);
    };

    const handleOpenContract = (e: React.MouseEvent, custApp: CustomerApplication) => {
        e.stopPropagation();
        const url = `${window.location.origin}/customer-applications/contract/pdf/application/${custApp.id}`;
        window.open(url, '_blank');
    };

    // Define table columns
    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account Number',
            sortable: true,
            render: (value) => <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{String(value || 'N/A')}</span>,
        },
        {
            key: 'identity',
            header: 'Name',
            sortable: true,
            render: (value) => {
                return (
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{value as string}</p>
                    </div>
                );
            },
        },
        {
            key: 'customer_type.full_text',
            header: 'Type',
            sortable: false,
            render: (value) => (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {String(value || 'N/A')}
                </span>
            ),
        },
        {
            key: 'application_contract.signed_at',
            header: 'Signature Status',
            sortable: true,
            render: (value) => (
                <Badge variant="outline" className={`${value ? 'text-green-500' : 'text-red-400'} font-medium transition-colors`}>
                    {value ? `Signed ${moment(String(value)).format('MMM DD, YYYY h:mmA')}` : 'Not signed'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Contract Signing', href: route('applications.contract-signing') },
            ]}
        >
            <Head title="Applications for Contract Signing" />
            <div className="space-y-6 p-4 lg:p-6">
                {/* Search Section */}
                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by customer name, account number..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 pr-10 pl-10"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            className="absolute top-2.5 right-3 flex h-5 w-5 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                                            onClick={() => setSearch('')}
                                            aria-label="Clear search"
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <PaginatedTable
                    data={
                        applications as unknown as {
                            data: Record<string, unknown>[];
                            current_page: number;
                            from: number | null;
                            last_page: number;
                            per_page: number;
                            to: number | null;
                            total: number;
                            links: Array<{ url?: string; label: string; active: boolean }>;
                        }
                    }
                    columns={columns}
                    title="Applications for Contract Signing"
                    onSort={handleSort}
                    currentSort={currentSort}
                    onRowClick={handleRowClick}
                    rowClassName={() => 'cursor-pointer hover:bg-muted/50'}
                    actions={(row) => {
                        const application = row as unknown as CustomerApplication;
                        // function handleOpenContract(e: MouseEvent<HTMLButtonElement, MouseEvent>, application: CustomerApplication) {
                        //     throw new Error('Function not implemented.');
                        // }

                        return (
                            <div className="flex justify-end gap-1">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSignClick(e, application);
                                    }}
                                    title="Capture Signature"
                                >
                                    <FileEdit className="mr-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenContract(e, application);
                                    }}
                                    title="View Contract"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                </Button>
                            </div>
                        );
                    }}
                    emptyMessage="No applications for contract signing found"
                />
            </div>

            <SigningDialog open={showSigningDialog} onOpenChange={setShowSigningDialog} application={selectedApplication} />
            <ApplicationSummaryDialog applicationId={selectedApplicationId} open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen} />
        </AppLayout>
    );
}
