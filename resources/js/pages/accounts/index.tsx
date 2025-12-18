import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import Select from '@/components/composables/select';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import ComprehensiveSummaryDialog from '@/components/comprehensive-summary-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import AppLayout from '@/layouts/app-layout';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { getStatusColor } from '@/lib/status-utils';
import { cn } from '@/lib/utils';
import { router, useForm, WhenVisible } from '@inertiajs/react';
import { EllipsisVertical, Eye, ListFilter, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type AccountFilter = {
    from?: Date | undefined;
    to?: Date | undefined;
    district?: string;
    barangay?: string;
    status?: string;
    customer_type?: string;
};
interface AccountsIndexProps {
    accounts: PaginatedData & {
        data: Account[];
    };
    search?: string;
    statuses: string[];
    filters?: AccountFilter;
    customer_types: CustomerType[];
}

export default function AccountsIndex({ accounts, search, statuses, filters, customer_types }: AccountsIndexProps) {
    const breadcrumbs = [{ title: 'Accounts', href: '#' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const filterForm = useForm<AccountFilter>({
        from: undefined,
        to: undefined,
        district: '',
        barangay: '',
        status: '',
        customer_type: '',
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
        filterForm.data.customer_type = '';

        submitFilter();
    };

    const [selectedApplicationId, setSelectedApplicationId] = useState<string | number | null>('');
    const [isOpenSummaryDialog, setIsOpenSummaryDialog] = useState(false);

    const customerTypesOptions = useMemo(
        () => [
            { label: 'All', value: 'All' },
            ...customer_types.map((type) => ({
                label: type.customer_type,
                value: type.id.toString(),
            })),
        ],
        [customer_types],
    );

    return (
        <AppLayout title="Accounts" breadcrumbs={breadcrumbs} className="overflow-hidden">
            <ComprehensiveSummaryDialog applicationId={selectedApplicationId} open={isOpenSummaryDialog} onOpenChange={setIsOpenSummaryDialog} />
            <SectionHeader className="relative flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearch(e.target.value.toString())}
                        icon={<Search size={16} />}
                        placeholder="Search accounts"
                        className="w-full max-w-80 rounded-3xl sm:max-w-90"
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                tooltip={isOpenFilter ? 'Close Filters' : 'Show Filters'}
                                variant="ghost"
                                onClick={() => {
                                    setIsOpenFilter(!isOpenFilter);
                                }}
                            >
                                <ListFilter />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2">
                            {/* <Input label="From" type="date" onDateChange={(date) => filterForm.setData('from', date)} value={filterForm.data.from} />
                            <Input label="To" type="date" onDateChange={(date) => filterForm.setData('to', date)} value={filterForm.data.to} /> */}
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
                                searchable={true}
                                label="Status"
                                options={statusOptions}
                                onValueChange={(value) => {
                                    filterForm.setData('status', value);
                                }}
                                value={filterForm.data.status}
                            />

                            <Select
                                searchable={true}
                                label="Customer Type"
                                options={customerTypesOptions}
                                onValueChange={(value) => {
                                    filterForm.setData('customer_type', value);
                                }}
                                value={filterForm.data.customer_type}
                            />

                            <div className="flex justify-end gap-2">
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
                        </PopoverContent>
                    </Popover>
                </div>
            </SectionHeader>
            <SectionContent className="overflow-hidden">
                <Table>
                    <TableHeader col={5}>
                        <TableData>Account Number</TableData>
                        <TableData>Account Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Customer Type</TableData>
                        <TableData>Status</TableData>
                        <TableData>Actions</TableData>
                    </TableHeader>

                    <TableBody className={cn('h-[calc(100vh-15rem)] sm:h-[calc(100vh-19.5rem)]')}>
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
                                        col={5}
                                        onClick={() => {
                                            handleSelectAccount(account.id);
                                        }}
                                        className="relative"
                                    >
                                        <TableData>{account.account_number}</TableData>
                                        <TableData>
                                            <div className="flex items-center gap-1">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={
                                                            account.customer_application.attachments?.find((a) => a.type === 'applicant-photo')
                                                                ?.path &&
                                                            `/storage/${account.customer_application.attachments.find((a) => a.type === 'applicant-photo')?.path}`
                                                        }
                                                        width={80}
                                                        height={80}
                                                        className="h-20 w-20 object-cover"
                                                    />
                                                    <AvatarFallback>
                                                        {(account.customer_application.first_name?.charAt(0) || '') +
                                                            (account.customer_application.last_name?.charAt(0) ||
                                                                account.customer_application.identity?.charAt(0) ||
                                                                '')}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <span className="font-medium">{account.account_name || account.customer_application.identity}</span>
                                            </div>
                                        </TableData>
                                        <TableData>{account.customer_application.full_address}</TableData>
                                        <TableData>{account.customer_application.customer_type.full_text}</TableData>

                                        <TableData>
                                            <Badge className={getStatusColor(account.account_status)}>{account.account_status}</Badge>
                                        </TableData>

                                        <TableData className="absolute top-0 right-0 flex w-full justify-end sm:static">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedApplicationId(account.customer_application.id);
                                                        setIsOpenSummaryDialog(true);
                                                    }}
                                                >
                                                    <Eye />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <EllipsisVertical />
                                                </Button>
                                            </div>
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
