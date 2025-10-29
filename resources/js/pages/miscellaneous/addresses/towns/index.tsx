import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Plus, Upload } from 'lucide-react';
import * as React from 'react';
import { toast, Toaster } from 'sonner';
import { PaginatedData, Town } from '../types';
import CreateBarangayForm from './components/create-barangay-form';
import CreateTownForm from './components/create-town-form';
import EditTownForm from './components/edit-town-form';
import TownTable from './components/town-table';
import UploadExcelDialog from './components/upload-excel-dialog';

interface Props {
    towns: PaginatedData<Town>;
}

export default function TownsIndex() {
    const page = usePage<SharedData & Props>();
    const { towns } = page.props;

    const [createTownOpen, setCreateTownOpen] = React.useState(false);
    const [createBarangayOpen, setCreateBarangayOpen] = React.useState(false);
    const [editTownOpen, setEditTownOpen] = React.useState(false);
    const [editingTown, setEditingTown] = React.useState<Town | null>(null);
    const [selectedTown, setSelectedTown] = React.useState<Town | null>(null);
    const [uploadOpen, setUploadOpen] = React.useState(false);

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

        router.get(route('addresses.towns.index'), { search: debouncedSearch || undefined }, { preserveState: true, replace: true });
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

    const handleEditTown = (town: Town) => {
        setEditingTown(town);
        setEditTownOpen(true);
    };

    const handleAddBarangay = (town: Town) => {
        setSelectedTown(town);
        setCreateBarangayOpen(true);
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Miscellaneous', href: '#' },
        { title: 'Addresses', href: '#' },
        { title: 'Towns', href: route('addresses.towns.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Towns" />

            <div className="max-w-full p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Towns</h1>
                        <p className="mt-2 text-muted-foreground">Manage towns and their associated barangays.</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <Button onClick={() => setCreateTownOpen(true)} className="w-full justify-start">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Town
                        </Button>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => setUploadOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Excel
                            </Button>
                            <a href={route('addresses.towns.export')}>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Excel
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Towns ({towns.total})</CardTitle>
                        <CardDescription>View and manage all towns in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TownTable
                            townsPaginated={towns}
                            searchQuery={searchInput}
                            setSearchQuery={setSearchInput}
                            onEditTown={handleEditTown}
                            onAddBarangay={handleAddBarangay}
                        />
                    </CardContent>
                </Card>

                <CreateTownForm open={createTownOpen} onOpenChange={setCreateTownOpen} />
                <EditTownForm open={editTownOpen} onOpenChange={setEditTownOpen} town={editingTown} />
                <CreateBarangayForm open={createBarangayOpen} onOpenChange={setCreateBarangayOpen} town={selectedTown} />
                <UploadExcelDialog open={uploadOpen} onOpenChange={setUploadOpen} />
                <Toaster />
            </div>
        </AppLayout>
    );
}
