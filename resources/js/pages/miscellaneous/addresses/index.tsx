import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import {
    Town,
    BarangayWithTown,
    townSchema,
    barangaySchema,
    TownForm as TownFormType,
    BarangayForm as BarangayFormType,
    PaginatedData,
} from './types';
import TownFormComponent from './components/TownForm';
import BarangayFormComponent from './components/BarangayForm';
import TownTable from './components/TownTable';
import BarangayTable from './components/BarangayTable';

interface Props {
    towns: PaginatedData<Town>;
    barangays: PaginatedData<BarangayWithTown>;
}

export default function CreateTownBarangay() {
    const page = usePage<SharedData & Props>();
    const { towns, barangays } = page.props;

    const [isSubmittingTown, setIsSubmittingTown] = React.useState(false);
    const [isSubmittingBarangay, setIsSubmittingBarangay] = React.useState(false);

    const initialTownSearch = new URLSearchParams(window.location.search).get('search_town') || '';
    const [searchTownInput, setSearchTownInput] = React.useState(initialTownSearch);
    const [debouncedTownSearch, setDebouncedTownSearch] = React.useState(searchTownInput);

    const initialBarangaySearch = new URLSearchParams(window.location.search).get('search_barangay') || '';
    const [searchBarangayInput, setSearchBarangayInput] = React.useState(initialBarangaySearch);
    const [debouncedBarangaySearch, setDebouncedBarangaySearch] = React.useState(searchBarangayInput);

    const isInitialMount = React.useRef(true);

    // Debounce town search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTownSearch(searchTownInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTownInput]);

    // Debounce barangay search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedBarangaySearch(searchBarangayInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchBarangayInput]);

    // Handle search with both params
    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('addresses.index'), {
            search_town: debouncedTownSearch || undefined,
            search_barangay: debouncedBarangaySearch || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedTownSearch, debouncedBarangaySearch]);

    const [activeFormTab, setActiveFormTab] = React.useState('town');
    const [activeListTab, setActiveListTab] = React.useState('towns');
    const [editingTown, setEditingTown] = React.useState<Town | null>(null);
    const [editingBarangay, setEditingBarangay] = React.useState<BarangayWithTown | null>(null);
    const [selectedTownId, setSelectedTownId] = React.useState<number | null>(null);
    const formCardRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const flash = page.props.flash;
        const errors = page.props.errors;

        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
        if (errors?.authorization) toast.error(errors.authorization);
    }, [page.props.flash, page.props.errors]);

    const townForm = useForm<TownFormType>({
        resolver: zodResolver(townSchema),
        defaultValues: { name: '', feeder: '' },
    });
    const barangayForm = useForm<BarangayFormType>({
        resolver: zodResolver(barangaySchema),
        defaultValues: { name: '', town_id: 0 },
    });

    const scrollToForm = () => {
        formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleEditTown = (town: Town) => {
        setEditingTown(town);
        townForm.reset({ name: town.name, feeder: town.feeder || '' });
        setActiveFormTab('town');
        setTimeout(() => scrollToForm(), 10);
    };

    const handleEditBarangay = (barangay: BarangayWithTown) => {
        setEditingBarangay(barangay);
        setSelectedTownId(barangay.townId);
        barangayForm.reset({ name: barangay.name, town_id: barangay.townId });
        setActiveFormTab('barangay');
        setTimeout(() => scrollToForm(), 10);
    };

    const handleCancelEdit = () => {
        setEditingTown(null);
        setEditingBarangay(null);
        setSelectedTownId(null);
        townForm.reset({ name: '', feeder: '' });
        barangayForm.reset({ name: '', town_id: 0 });
    };

    const onSubmitTown = async (data: TownFormType) => {
        setIsSubmittingTown(true);
        const url = editingTown
            ? route('addresses.update-town', editingTown.id)
            : route('addresses.store-town');
        router.post(url, editingTown ? { ...data, _method: 'PUT' } : data, {
            preserveScroll: true,
            onSuccess: (page) => {
                townForm.reset();
                setEditingTown(null);
                if (!editingTown) {
                    const updatedTowns = (page.props as unknown as Props).towns.data;
                    const newlyCreatedTown = updatedTowns.find(
                        (town) => town.name.toLowerCase() === data.name.toLowerCase(),
                    );
                    if (newlyCreatedTown) {
                        setSelectedTownId(newlyCreatedTown.id);
                        barangayForm.setValue('town_id', newlyCreatedTown.id);
                        setActiveFormTab('barangay');
                    }
                }
            },
            onError: (errors) => {
                let errorMessage = editingTown ? 'Failed to update town.' : 'Failed to create town.';
                if (errors.authorization) errorMessage = errors.authorization;
                else if (typeof errors === 'object' && errors) {
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) errorMessage = errorMessages.join(', ');
                }
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmittingTown(false),
        });
    };

    const onSubmitBarangay = async (data: BarangayFormType) => {
        setIsSubmittingBarangay(true);
        const url = editingBarangay
            ? route('addresses.update-barangay', editingBarangay.id)
            : route('addresses.store-barangay');
        router.post(url, editingBarangay ? { ...data, _method: 'PUT' } : data, {
            preserveScroll: true,
            onSuccess: () => {
                barangayForm.reset();
                setEditingBarangay(null);
                setSelectedTownId(null);
            },
            onError: (errors) => {
                let errorMessage = editingBarangay ? 'Failed to update barangay.' : 'Failed to create barangay.';
                if (errors.authorization) errorMessage = errors.authorization;
                else if (typeof errors === 'object' && errors) {
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) errorMessage = errorMessages.join(', ');
                }
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmittingBarangay(false),
        });
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Miscellaneous', href: '#' },
        { title: 'Create Town & Barangay', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Town & Barangay" />

            <div className="max-w-full p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Addresses</h1>
                    <p className="mt-2 text-muted-foreground">
                        Add new towns and barangays to the system.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card ref={formCardRef}>
                        <CardHeader>
                            <CardTitle>
                                {editingTown
                                    ? 'Edit Town'
                                    : editingBarangay
                                      ? 'Edit Barangay'
                                      : 'Add Town or Barangay'}
                            </CardTitle>
                            <CardDescription>
                                {editingTown || editingBarangay
                                    ? 'Update the information below.'
                                    : 'Switch between tabs to add a new town or barangay.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                value={activeFormTab}
                                onValueChange={(value) => {
                                    setActiveFormTab(value);
                                    handleCancelEdit();
                                }}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="town">Town Form</TabsTrigger>
                                    <TabsTrigger value="barangay">Barangay Form</TabsTrigger>
                                </TabsList>

                                <TabsContent value="town" className="mt-4">
                                    <TownFormComponent
                                        form={townForm}
                                        onSubmit={onSubmitTown}
                                        isSubmitting={isSubmittingTown}
                                        editingTown={editingTown}
                                        onCancelEdit={handleCancelEdit}
                                    />
                                </TabsContent>

                                <TabsContent value="barangay" className="mt-4">
                                    <BarangayFormComponent
                                        form={barangayForm}
                                        onSubmit={onSubmitBarangay}
                                        isSubmitting={isSubmittingBarangay}
                                        editingBarangay={editingBarangay}
                                        onCancelEdit={handleCancelEdit}
                                        towns={towns.data}
                                        selectedTownId={selectedTownId}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>View Towns & Barangays</CardTitle>
                            <CardDescription>
                                Browse existing towns and barangays. Use the tabs to switch between
                                views.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeListTab} onValueChange={setActiveListTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="towns">Towns ({towns.total})</TabsTrigger>
                                    <TabsTrigger value="barangays">
                                        Barangays ({barangays.total})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="towns" className="mt-4">
                                    <TownTable
                                        townsPaginated={towns}
                                        searchQuery={searchTownInput}
                                        setSearchQuery={setSearchTownInput}
                                        onEditTown={handleEditTown}
                                        onAddBarangay={(town) => {
                                            handleCancelEdit();
                                            setSelectedTownId(town.id);
                                            barangayForm.setValue('town_id', town.id);
                                            setActiveFormTab('barangay');
                                            setTimeout(() => scrollToForm(), 10);
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="barangays" className="mt-4">
                                    <BarangayTable
                                        barangaysPaginated={barangays}
                                        searchQuery={searchBarangayInput}
                                        setSearchQuery={setSearchBarangayInput}
                                        onEditBarangay={handleEditBarangay}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <Toaster />
            </div>
        </AppLayout>
    );
}
