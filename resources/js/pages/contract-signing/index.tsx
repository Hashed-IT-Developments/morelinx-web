import AppLayout from '@/layouts/app-layout';

import { cn, formatSplitWords, getStatusColor, useDebounce } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';

import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import PaginatedTable, { ColumnDefinition } from '@/components/ui/paginated-table';
import { useEffect, useState } from 'react';

interface ContractSigningProps {
    applications: PaginatedData & { data: CustomerApplication[] };
    search?: string | null;
}

export default function ContractSigning({ applications, search = null }: ContractSigningProps) {
    const breadcrumbs = [
        { title: 'Applications', href: '/applications' },
        { title: 'Contract Signing', href: '/applications/contract-signing' }
    ];
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<CustomerApplication | null>(null);

    useEffect(() => {
        console.log('Applications Data:', applications);
        console.log('Search Value:', search);
    }, [applications, search]);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get('/applications/contract-signing', { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get('/applications/contract-signing', { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    const handleSignClick = (e: React.MouseEvent, custApp: CustomerApplication) => {
        e.stopPropagation();
        setSelectedApplication(custApp);
        setIsModalOpen(true);
    };

    const columns: ColumnDefinition[] = [
        {
            key: 'account_number',
            header: 'Account #',
            sortable: true,
            render: (value) => (
                <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                    {String(value || 'N/A')}
                </span>
            ),
        },
        {
            key: 'first_name',
            header: 'Name',
            sortable: true,
            render: (value, row) => {
                const application = row as unknown as CustomerApplication;
                return (
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {application.first_name} {application.middle_name} {application.last_name} {application.suffix}
                        </p>
                    </div>
                );
            },
        },
        {
            key: 'email_address',
            header: 'Email',
            sortable: true,
            render: (value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {String(value || 'N/A')}
                </span>
            ),
        },
        {
            key: 'customer_type.full_text',
            header: 'Type',
            sortable: false,
            render: (value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {String(value || 'N/A')}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value) => (
                <Badge
                    variant="outline"
                    className={cn(
                        'font-medium text-sm',
                        value ? getStatusColor(value as string) : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    )}
                >
                    {formatSplitWords(value as string)}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Applications for Contract Signing" />
            <div className="flex justify-center p-4">
                <div className="w-full max-w-4xl gap-3">
                    <Input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        icon={<Search size={16} />}
                        className="rounded-3xl"
                        placeholder="Search applications for contract signing"
                    />
                </div>
            </div>
            <section className="px-4">
                <PaginatedTable
                    data={{
                        data: applications?.data || [],
                        current_page: applications?.current_page || 1,
                        from: applications?.from || null,
                        last_page: applications?.last_page || 1,
                        per_page: applications?.per_page || 15,
                        to: applications?.to || null,
                        total: applications?.total || 0,
                        links: applications?.links || [],
                    }}
                    columns={columns}
                    title="Applications for Contract Signing"
                    actions={(row) => {
                        const application = row as unknown as CustomerApplication;
                        return (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSignClick(e, application);
                                    }}
                                >
                                    Sign Contract
                                </Button>
                            </div>
                        );
                    }}
                    rowClassName={() => "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"}
                    onPageChange={(url) => {
                        const params = new URLSearchParams();
                        if (searchInput) params.set('search', searchInput);

                        const separator = url.includes('?') ? '&' : '?';
                        router.get(url + separator + params.toString());
                    }}
                    emptyMessage="No applications for contract signing found"
                />
            </section>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign Contract</DialogTitle>
                        <DialogDescription>
                            {selectedApplication &&
                                `Sign contract for ${selectedApplication.first_name} ${selectedApplication.last_name}`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-500">Modal content coming soon...</p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            console.log('Signing contract for:', selectedApplication?.id);
                            setIsModalOpen(false);
                        }}>
                            Sign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
