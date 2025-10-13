import AppLayout from '@/layouts/app-layout';

import { cn, getStatusColor, useDebounce } from '@/lib/utils';
import { Head, router, WhenVisible } from '@inertiajs/react';

import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, EllipsisVertical, Search } from 'lucide-react';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';

interface CustomerApplicationProps {
    applications: PaginationMeta & { data: CustomerApplication[] };
    search?: string | null;
}

export default function CustomerApplications({ applications, search = null }: CustomerApplicationProps) {
    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        if ((debouncedSearch === '' || debouncedSearch == null) && search && search !== '') {
            router.get('/applications', { search: '' });
        } else if (debouncedSearch != null && debouncedSearch !== '' && debouncedSearch !== search) {
            router.get('/applications', { search: debouncedSearch });
        }
    }, [debouncedSearch, search]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handlePage = (url: string | undefined) => {
        if (url) {
            router.get(url, {
                ...(debouncedSearch ? { search: debouncedSearch } : {}),
            });
        }
    };

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
    };

    console.log(applications);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex justify-center p-4">
                <div className="w-full max-w-4xl gap-3">
                    <Input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        icon={<Search size={16} />}
                        className="rounded-3xl"
                        placeholder="Search applications"
                    />
                </div>
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
                        <WhenVisible
                            data="applications"
                            fallback={() => (
                                <div className="flex h-[calc(100vh-17.5rem)] w-full items-center justify-center text-center text-sm font-medium text-gray-500">
                                    Loading...
                                </div>
                            )}
                        >
                            {!applications ? (
                                <div className="flex h-[calc(100vh-17.5rem)] w-full items-center justify-center text-center text-sm font-medium text-gray-500">
                                    No applications found.
                                </div>
                            ) : (
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
                                                className={cn(
                                                    'font-medium1 text-sm',
                                                    custApp?.status === 'rejected' ? 'text-red-600' : 'text-green-600',
                                                )}
                                            >
                                                <Badge className={getStatusColor(custApp.status)}>{custApp.status}</Badge>
                                            </span>

                                            <span className="absolute top-0 right-0 p-2">
                                                <Button variant="ghost" className="cursor-pointer">
                                                    <EllipsisVertical />
                                                </Button>
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </WhenVisible>
                    </div>
                    <div className="text-weak flex flex-col items-center justify-between gap-3 border-t px-6 py-3 text-sm font-medium md:flex-row">
                        <div className="flex items-center gap-3">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            className={cn(!applications?.prev_page_url ? 'hidden' : '')}
                                            onClick={() => {
                                                handlePage(`/applications?page=1`);
                                            }}
                                        >
                                            <ChevronsLeft />
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            className={cn(!applications?.prev_page_url ? 'hidden' : '')}
                                            onClick={() => {
                                                handlePage(applications?.prev_page_url ?? '');
                                            }}
                                        >
                                            <ChevronLeft />
                                        </Button>
                                    </PaginationItem>
                                    <div className="flex sm:hidden">
                                        {applications &&
                                            (() => {
                                                const { last_page, current_page } = applications;
                                                const maxPagesToShow = 3;
                                                let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
                                                const endPage = Math.min(last_page, startPage + maxPagesToShow - 1);
                                                startPage = Math.max(1, endPage - maxPagesToShow + 1);

                                                return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                                                    const pageNumber = startPage + index;
                                                    const pageUrl = `/applications?page=${pageNumber}`;
                                                    return (
                                                        <PaginationItem key={pageNumber}>
                                                            <Button
                                                                variant={current_page === pageNumber ? 'default' : 'ghost'}
                                                                onClick={() => handlePage(pageUrl)}
                                                            >
                                                                {pageNumber}
                                                            </Button>
                                                        </PaginationItem>
                                                    );
                                                });
                                            })()}
                                    </div>
                                    <div className="hidden sm:flex">
                                        {applications &&
                                            (() => {
                                                const { last_page, current_page } = applications;
                                                const maxPagesToShow = 9;
                                                let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
                                                const endPage = Math.min(last_page, startPage + maxPagesToShow - 1);
                                                startPage = Math.max(1, endPage - maxPagesToShow + 1);

                                                return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                                                    const pageNumber = startPage + index;
                                                    const pageUrl = `/applications?page=${pageNumber}`;
                                                    return (
                                                        <PaginationItem key={pageNumber}>
                                                            <Button
                                                                variant={current_page === pageNumber ? 'default' : 'ghost'}
                                                                onClick={() => handlePage(pageUrl)}
                                                            >
                                                                {pageNumber}
                                                            </Button>
                                                        </PaginationItem>
                                                    );
                                                });
                                            })()}
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <PaginationItem>
                                                <Button variant="ghost">
                                                    <PaginationEllipsis />
                                                </Button>
                                            </PaginationItem>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2">
                                            <div className="grid max-h-90 grid-cols-3 gap-2 overflow-y-auto">
                                                {Array.from({ length: applications?.last_page ?? 1 }, (_, idx) => {
                                                    const pageNumber = idx + 1;
                                                    const pageUrl = `/applications?page=${pageNumber}`;
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            size="sm"
                                                            variant={applications?.current_page === pageNumber ? 'default' : 'ghost'}
                                                            onClick={() => handlePage(pageUrl)}
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            className={cn(!applications?.next_page_url ? 'hidden' : '')}
                                            onClick={() => {
                                                handlePage(applications?.next_page_url ?? '');
                                            }}
                                        >
                                            <ChevronRight />
                                        </Button>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            className={cn(!applications?.next_page_url ? 'hidden' : '')}
                                            onClick={() => {
                                                handlePage(`/applications?page=${applications?.last_page}`);
                                            }}
                                        >
                                            <ChevronsRight />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                        <span>
                            Page {applications?.current_page ?? 1} of {applications?.last_page ?? 1}
                        </span>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
