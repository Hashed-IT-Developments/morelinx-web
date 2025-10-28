import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast, Toaster } from 'sonner';
import { BarangayWithTown, PaginatedData } from '../types';
import BarangayTable from './components/barangay-table';
import EditBarangayForm from './components/edit-barangay-form';

interface Props {
    barangays: PaginatedData<BarangayWithTown>;
}

export default function BarangaysIndex() {
    const page = usePage<SharedData & Props>();
    const { barangays } = page.props;

    const [editBarangayOpen, setEditBarangayOpen] = React.useState(false);
    const [editingBarangay, setEditingBarangay] = React.useState<BarangayWithTown | null>(null);

    const initialSearch = new URLSearchParams(window.location.search).get('search') || '';
    const [searchInput, setSearchInput] = React.useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchInput);

    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('addresses.barangays.index'), { search: debouncedSearch || undefined }, { preserveState: true, replace: true });
    }, [debouncedSearch]);

    React.useEffect(() => {
        const flash = page.props.flash;
        const errors = page.props.errors;

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
        if (errors?.authorization) toast.error(errors.authorization);
    }, [page.props.flash, page.props.errors]);

    const handleEditBarangay = (barangay: BarangayWithTown) => {
        setEditingBarangay(barangay);
        setEditBarangayOpen(true);
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Miscellaneous', href: '#' },
        { title: 'Addresses', href: '#' },
        { title: 'Barangays', href: route('addresses.barangays.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangays" />

            <div className="max-w-full p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Barangays</h1>
                    <p className="mt-2 text-muted-foreground">View and manage all barangays in the system.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Barangays ({barangays.total})</CardTitle>
                        <CardDescription>View and edit barangays. To add new barangays, go to the Towns page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarangayTable
                            barangaysPaginated={barangays}
                            searchQuery={searchInput}
                            setSearchQuery={setSearchInput}
                            onEditBarangay={handleEditBarangay}
                        />
                    </CardContent>
                </Card>

                <EditBarangayForm open={editBarangayOpen} onOpenChange={setEditBarangayOpen} barangay={editingBarangay} />

                <Toaster />
            </div>
        </AppLayout>
    );
}
