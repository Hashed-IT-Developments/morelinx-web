import AppLayout from '@/layouts/app-layout';

import { cn, useDebounce } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { EllipsisVertical } from 'lucide-react';

export default function Index() {
    const [applications, setApplications] = useState<PaginationMeta | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearchInput = useDebounce(searchInput, 400);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleFetchCustomerApplications = useCallback(() => {
        setIsLoading(true);

        axios
            .get('/customer-applications', {
                params: { search_value: debouncedSearchInput },
            })
            .then((response) => {
                setApplications(response.data);
            })
            .catch((error: unknown) => {
                console.error('Error fetching customer applications:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [debouncedSearchInput]);

    useEffect(() => {
        handleFetchCustomerApplications();
    }, [debouncedSearchInput, handleFetchCustomerApplications]);

    const handlePage = (applications: PaginationMeta | null, direction: 'previous' | 'next') => {
        if (!applications) return;

        const { current_page, last_page } = applications;

        if (direction === 'previous' && current_page > 1) {
            axios
                .get('/customer-applications', {
                    params: { page: current_page - 1, search_value: debouncedSearchInput },
                })
                .then((response) => {
                    setApplications(response.data);
                });
        } else if (direction === 'next' && current_page < last_page) {
            axios
                .get('/customer-applications', {
                    params: { page: current_page + 1, search_value: debouncedSearchInput },
                })
                .then((response) => {
                    setApplications(response.data);
                });
        }
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-4">
                <input
                    type="text"
                    onChange={handleSearchInputChange}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Search applications"
                />
            </div>

            <section className="px-4">
                <div className="border-strong overflow-hidden rounded-xl border">
                    <div className="bg-sand-dugout text-weak hidden border-b px-5 pt-4 pb-3 text-sm font-medium md:grid md:[grid-template-columns:repeat(5,minmax(0,1fr))_60px]">
                        <div>Account #</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Type</div>
                        <div>Status</div>
                    </div>
                    <div className="h-[calc(100vh-17.5rem)] divide-y divide-gray-200 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-button]:hidden">
                        {isLoading ? (
                            <div className="flex h-full w-full items-center justify-center p-10 text-center text-sm font-medium text-gray-500">
                                Loading...
                            </div>
                        ) : (applications?.data?.length ?? 0) > 0 ? (
                            applications?.data?.map((custApp: CustomerApplication) => (
                                <div
                                    key={custApp.id}
                                    className="relative cursor-pointer px-6 py-4 hover:bg-gray-50"
                                    onClick={() => handleSelectApplication(custApp.id)}
                                >
                                    <div className="grid gap-3 md:[grid-template-columns:repeat(5,minmax(0,1fr))_60px] md:items-center">
                                        <span className="truncate text-sm font-medium">{custApp?.account_number}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="truncate text-sm font-medium">
                                                {custApp?.first_name} {custApp?.middle_name} {custApp?.last_name} {custApp?.suffix}
                                            </span>
                                        </div>
                                        <span className="truncate text-sm font-medium">{custApp?.email_address}</span>

                                        <span className="truncate text-sm font-medium">{custApp?.customer_type?.full_text}</span>
                                        <span
                                            className={cn('font-medium1 text-sm', custApp?.status === 'rejected' ? 'text-red-600' : 'text-green-600')}
                                        >
                                            <Badge
                                                className={
                                                    custApp.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : custApp.status === 'approved'
                                                          ? 'bg-green-100 text-green-800'
                                                          : custApp.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                }
                                                variant={custApp.status === 'approved' ? 'secondary' : 'default'}
                                            >
                                                {custApp.status}
                                            </Badge>
                                        </span>

                                        <span className="absolute top-0 right-0 p-2">
                                            <Button variant="ghost" className="cursor-pointer">
                                                <EllipsisVertical />
                                            </Button>
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-4 text-center text-gray-500">No applications found.</div>
                        )}
                    </div>
                    <div className="text-weak flex flex-col items-center justify-between gap-3 border-t px-6 py-3 text-sm font-medium md:flex-row">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handlePage(applications, 'previous')}
                                shape="rounded"
                                disabled={applications?.current_page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handlePage(applications, 'next')}
                                shape="rounded"
                                disabled={applications?.current_page === applications?.last_page}
                            >
                                Next
                            </Button>
                        </div>
                        <span>
                            Page {applications?.current_page} of {applications?.last_page}
                        </span>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
