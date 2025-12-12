import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import Select from '@/components/composables/select';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Badge } from '@/components/ui/badge';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import AppLayout from '@/layouts/app-layout';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { getStatusColor } from '@/lib/status-utils';
import { cn } from '@/lib/utils';
import { router, useForm, WhenVisible } from '@inertiajs/react';
import { ListFilter, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type AccountFilter = {
    from?: Date | undefined;
    to?: Date | undefined;
    district?: string;
    barangay?: string;
    status?: string;
};
interface AccountsIndexProps {
    accounts: PaginatedData & {
        data: Account[];
    };
    search?: string;
    statuses: string[];
    filters?: AccountFilter;
}

export default function AccountsIndex({ accounts, search, statuses, filters }: AccountsIndexProps) {
    const breadcrumbs = [{ title: 'Accounts', href: '#' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const filterForm = useForm<AccountFilter>({
        from: undefined,
        to: undefined,
        district: '',
        barangay: '',
        status: '',
    });

    const [hasFilter, setHasFilter] = useState(false);

    const [isOpenFilter, setIsOpenFilter] = useState(false);

    useEffect(() => {
        if (filters) {
            filterForm.setData({
                from: filters.from ?? undefined,
                to: filters.to ?? undefined,
                district: filters.district ?? '',
                barangay: filters.barangay ?? '',
                status: filters.status ?? '',
            });

            const hasActualFilters = Object.values(filters).some((value) => {
                if (value instanceof Date) return true;
                if (value === undefined || value === null || value === '') return false;
                return true;
            });

            setIsOpenFilter(hasActualFilters);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    useEffect(() => {
        const hasFilter = Object.values(filterForm.data).some((value) => {
            if (value instanceof Date) {
                return true;
            }
            return value !== undefined && value !== '';
        });

        setHasFilter(hasFilter);
    }, [filterForm.data]);

    const debouncedSearch = useCallback((searchTerm: string) => {
        const query: AccountFilter & { search?: string } = {
            ...filterForm.data,
            search: searchTerm,
        };

        router.get('/accounts', query, {
            preserveState: true,
            preserveScroll: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchInput === (search ?? '')) return;

        const timeoutId = setTimeout(() => {
            debouncedSearch(searchInput);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchInput, debouncedSearch, search]);

    const handleSelectAccount = (id: string | number) => {
        router.get(`/account/${id}`);
    };

    const { towns, barangays } = useTownsAndBarangays(filterForm.data.district);

    const townOptions = useMemo(
        () =>
            towns.map((town) => ({
                label: town.name,
                value: town.id.toString(),
            })),
        [towns],
    );

    const barangayOptions = useMemo(
        () =>
            barangays.map((barangay) => ({
                label: barangay.name,
                value: barangay.id.toString(),
            })),
        [barangays],
    );

    const statusOptions = useMemo(
        () => [
            { label: 'All', value: 'All' },
            ...statuses.map((status) => ({
                label: status,
                value: status,
            })),
        ],
        [statuses],
    );

    const submitFilter = () => {
        const query: Record<string, string> = {};

        Object.entries(filterForm.data).forEach(([key, value]) => {
            if (value) {
                query[key] = value instanceof Date ? value.toISOString() : String(value);
            }
        });

        if (searchInput) query.search = searchInput;

        router.get('/accounts', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        filterForm.data.from = undefined;
        filterForm.data.to = undefined;
        filterForm.data.district = '';
        filterForm.data.barangay = '';
        filterForm.data.status = '';
        submitFilter();
    };

    return (
        <AppLayout title="Accounts" breadcrumbs={breadcrumbs} className="overflow-hidden">
            <SectionHeader className="relative flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearch(e.target.value.toString())}
                        icon={<Search size={16} />}
                        placeholder="Search accounts"
                        className="w-full max-w-80 rounded-3xl sm:max-w-90"
                    />

                    <Button
                        tooltip={isOpenFilter ? 'Close Filters' : 'Show Filters'}
                        variant="ghost"
                        onClick={() => {
                            setIsOpenFilter(!isOpenFilter);
                        }}
                    >
                        <ListFilter />
                    </Button>
                </div>

                {isOpenFilter && (
                    <section className="absolute top-15 z-50 mx-2 w-full justify-start p-2 sm:static sm:p-0">
                        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-background p-2 shadow-md sm:border-none sm:shadow-none">
                            <Input label="From" type="date" onDateChange={(date) => filterForm.setData('from', date)} value={filterForm.data.from} />
                            <Input label="To" type="date" onDateChange={(date) => filterForm.setData('to', date)} value={filterForm.data.to} />
                            <Select
                                id="district"
                                onValueChange={(value) => {
                                    filterForm.setData('district', value);
                                }}
                                value={filterForm.data.district}
                                label="District"
                                searchable={true}
                                options={townOptions}
                                error={filterForm.errors.district}
                            />

                            {filterForm.data.district && (
                                <Select
                                    id="barangay"
                                    onValueChange={(value) => {
                                        filterForm.setData('barangay', value);
                                    }}
                                    value={filterForm.data.barangay}
                                    label="Barangay"
                                    searchable={true}
                                    options={barangayOptions}
                                    error={filterForm.errors.barangay}
                                />
                            )}
                            <Select
                                label="Status"
                                options={statusOptions}
                                onValueChange={(value) => {
                                    filterForm.setData('status', value);
                                }}
                                value={filterForm.data.status}
                            />

                            {hasFilter && (
                                <Button
                                    tooltip="Clear"
                                    mode="danger"
                                    onClick={() => {
                                        handleReset();
                                    }}
                                >
                                    Clear
                                </Button>
                            )}

                            <Button
                                tooltip="Submit Filter"
                                mode="success"
                                onClick={() => {
                                    submitFilter();
                                }}
                            >
                                Filter
                            </Button>
                        </div>
                    </section>
                )}
            </SectionHeader>
            <SectionContent className="overflow-hidden">
                <Table>
                    <TableHeader col={4}>
                        <TableData>Name</TableData>
                        <TableData>Type</TableData>
                        <TableData>Address</TableData>
                        <TableData>Status</TableData>
                    </TableHeader>

                    <TableBody
                        className={cn(
                            'h-[calc(100vh-15rem)] sm:h-[calc(100vh-19.5rem)]',

                            isOpenFilter && 'h-[calc(100vh-15rem)] sm:h-[calc(100vh-24rem)]',
                        )}
                    >
                        <WhenVisible
                            data="accounts"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {!(accounts?.data.length > 0) ? (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">No applications found.</span>
                                </div>
                            ) : (
                                accounts?.data.map((account: Account) => (
                                    <TableRow
                                        key={account.id}
                                        col={4}
                                        onClick={() => {
                                            handleSelectAccount(account.id);
                                        }}
                                    >
                                        <TableData>{account.account_name || account.customer_application.identity}</TableData>
                                        <TableData>{account.customer_application.customer_type.full_text}</TableData>
                                        <TableData>{account.customer_application.full_address}</TableData>
                                        <TableData>
                                            <Badge className={getStatusColor(account.account_status)}>{account.account_status}</Badge>
                                        </TableData>
                                    </TableRow>
                                ))
                            )}
                        </WhenVisible>
                    </TableBody>

                    <TableFooter>
                        <Pagination pagination={accounts} search={searchInput} filters={filterForm.data} />
                    </TableFooter>
                </Table>
            </SectionContent>
        </AppLayout>
    );
}
