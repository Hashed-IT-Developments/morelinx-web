import AppLayout from '@/layouts/app-layout';

import { getStatusColor } from '@/lib/status-utils';
import { cn, formatSplitWords } from '@/lib/utils';
import { router, WhenVisible } from '@inertiajs/react';

import Input from '@/components/composables/input';
import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import SectionContent from '@/layouts/app/section-content';
import SectionHeader from '@/layouts/app/section-header';
import { Contact, File, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/composables/button';
import Select from '@/components/composables/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { useForm } from '@inertiajs/react';
import { ListFilter } from 'lucide-react';

type ApplicationFilter = {
    from?: Date | undefined;
    to?: Date | undefined;
    district?: string;
    barangay?: string;
    status?: string;
};

interface CustomerApplicationProps {
    applications: PaginatedData & { data: CustomerApplication[] };
    search?: string | null;
    statuses: string[];
    filters?: ApplicationFilter;
}

export default function CustomerApplications({ applications, search = null, statuses, filters }: CustomerApplicationProps) {
    const breadcrumbs = [{ title: 'Applications', href: '/applications' }];
    const [searchInput, setSearch] = useState(search ?? '');

    const filterForm = useForm<ApplicationFilter>({
        from: undefined,
        to: undefined,
        district: '',
        barangay: '',
        status: '',
    });

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

    const [hasFilter, setHasFilter] = useState(false);

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
        const query: ApplicationFilter & { search?: string } = {
            ...filterForm.data,
            search: searchTerm,
        };

        router.get('/applications', query, {
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

    const handleSelectApplication = (applicationId: string) => {
        router.visit('/applications/' + applicationId);
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

        router.get('/applications', query, {
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
        <AppLayout title="Dashboard" breadcrumbs={breadcrumbs} className="overflow-y-hidden">
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
                    <TableHeader col={6}>
                        <TableData>Account #</TableData>
                        <TableData>Name</TableData>
                        <TableData>Address</TableData>
                        <TableData>Contact</TableData>
                        <TableData>Type</TableData>
                        <TableData className="col-span-2 w-full justify-center">Status</TableData>
                    </TableHeader>
                    <TableBody className={cn('h-[calc(100vh-15rem)] sm:h-[calc(100vh-19.5rem)]')}>
                        <WhenVisible
                            data="applications"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {!applications ? (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">No applications found.</span>
                                </div>
                            ) : (
                                applications?.data?.map((custApp: CustomerApplication) => (
                                    <TableRow key={custApp.id} col={6} onClick={() => handleSelectApplication(custApp?.id)}>
                                        <TableData className="grid grid-cols-2 sm:hidden">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="bg-linear-to-br from-green-500 to-purple-600 text-white">
                                                        {custApp?.first_name?.charAt(0)}
                                                        {custApp?.last_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <h1 className="flex max-w-md text-lg leading-tight font-medium wrap-break-word text-gray-900">
                                                        {custApp?.identity}
                                                    </h1>

                                                    <span>{custApp?.account_number}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <Badge
                                                    className={cn(
                                                        'font-medium1 text-sm',
                                                        custApp.status
                                                            ? getStatusColor(custApp.status)
                                                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                    )}
                                                >
                                                    {formatSplitWords(custApp.status)}
                                                </Badge>
                                            </div>
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={custApp?.account_number}>
                                            {custApp?.account_number}
                                        </TableData>
                                        <TableData className="hidden truncate sm:block" tooltip={custApp?.full_name || custApp?.identity}>
                                            {custApp?.identity}
                                        </TableData>

                                        <TableData className="col-span-2 truncate" tooltip={custApp?.full_address}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <MapPin size={12} />
                                                    Address:
                                                </span>
                                                <div className="flex max-w-60 flex-col leading-tight wrap-break-word">
                                                    <span>{custApp?.full_address}</span>
                                                </div>
                                            </div>
                                        </TableData>

                                        <TableData
                                            className="col-span-2 truncate"
                                            tooltip={(custApp?.email_address ?? '') + ' ' + (custApp?.tel_no_1 ?? '')}
                                        >
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <Contact size={12} />
                                                    Contact:
                                                </span>
                                                <div className="flex max-w-60 flex-col leading-tight wrap-break-word">
                                                    <span className="truncate">{custApp?.email_address}</span>
                                                    <span className="truncate">{custApp?.tel_no_1}</span>
                                                </div>
                                            </div>
                                        </TableData>
                                        <TableData className="truncate" tooltip={custApp?.customer_type?.full_text}>
                                            <div>
                                                <span className="flex items-center gap-1 sm:hidden">
                                                    <File size={12} />
                                                    Type:
                                                </span>
                                                <span className="truncate">{custApp?.customer_type?.full_text}</span>
                                            </div>
                                        </TableData>
                                        <TableData className="col-span-2 hidden w-full justify-center sm:flex">
                                            <Badge
                                                className={cn(
                                                    'font-medium1 text-sm',
                                                    custApp.status
                                                        ? getStatusColor(custApp.status)
                                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                                                )}
                                            >
                                                {formatSplitWords(custApp.status)}
                                            </Badge>
                                        </TableData>
                                    </TableRow>
                                ))
                            )}
                        </WhenVisible>
                    </TableBody>
                    <TableFooter>
                        <Pagination search={searchInput} filters={filterForm.data} pagination={applications} />
                    </TableFooter>
                </Table>
            </SectionContent>
        </AppLayout>
    );
}
