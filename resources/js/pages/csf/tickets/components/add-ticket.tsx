import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';

import { Plus } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import AlertDialog from '@/components/composables/alert-dialog';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SearchUsers from './search-users';

interface AddTicketProps {
    ticket_types: TicketType[];
    concern_types: TicketType[];
    roles: Role[];
    account?: Account | null;
    type: string;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    onClick?: () => void;
}

import { useTicketTypeMethod } from '@/hooks/useTicketTypeMethod';

export default function AddTicket({ roles, account, type, isOpen, setOpen, onClick }: AddTicketProps) {
    const form = useForm({
        account_id: '',
        consumer_name: '',
        caller_name: '',
        district: '',
        landmark: '',
        sitio: '',
        barangay: '',
        phone: '',
        ticket_type: '',
        concern_type: '',
        concern: '',
        reason: '',
        severity: 'low',
        assign_department_id: '',
        assign_user: '',
        remarks: '',
        assignation_type: 'user',
        assign_user_id: '',
    });

    const { getTicketTypes } = useTicketTypeMethod();

    const [ticket_types, setTicketTypes] = useState<TicketType[]>([]);
    const [concern_types, setConcernTypes] = useState<TicketType[]>([]);

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const response = await getTicketTypes({ type: 'ticket_type' });
                setTicketTypes(response.data);

                const concernResponse = await getTicketTypes({ type: 'concern_type' });

                setConcernTypes(concernResponse.data);
            } catch (error) {
                console.error('Failed to fetch ticket types:', error);
            }
        };
        fetchTicketTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, account]);

    const onUserSelect = useCallback(
        (userId: string | number) => {
            form.setData('assign_user_id', userId.toString());
        },
        [form],
    );

    const { towns, barangays } = useTownsAndBarangays(form.data.district);

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

    const ticketTypeOptions = useMemo(
        () =>
            ticket_types?.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            })) || [],
        [ticket_types],
    );

    const concernTypeOptions = useMemo(
        () =>
            concern_types?.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            })) || [],
        [concern_types],
    );

    const roleOptions = useMemo(
        () =>
            roles?.map((role) => ({
                label: role.name,
                value: role.id.toString(),
            })) || [],
        [roles],
    );

    const submitForm = () => {
        form.post(`/tickets/store/`, {
            onSuccess: (response) => {
                const flash = (response.props.flash as { success?: string }) || {};
                toast.success('Ticket created successfully' + (flash.success ? `: ${flash.success}` : ''));
                form.reset();
                setOpen(false);
            },
            onError: (errors) => {
                if (errors && typeof errors === 'object') {
                    Object.values(errors).forEach((err) => {
                        toast.error('Failed to create ticket: ' + err);
                    });
                } else {
                    toast.error('Failed to create ticket');
                }
            },
        });
    };

    useEffect(() => {
        if (isOpen && type === 'account' && account) {
            form.setData({
                ...form.data,
                account_id: account.id?.toString() || '',
                consumer_name: account.account_name || '',
                caller_name: account.account_name || '',
                phone: account.contact_number || '',
                barangay: account.barangay_id?.toString() || '',
                district: account.district_id?.toString() || '',
            });
        }
        if (!isOpen) {
            form.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, account]);
    return (
        <main>
            <Sheet open={isOpen} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" onClick={onClick}>
                        Create Ticket <Plus />
                    </Button>
                </SheetTrigger>
                <SheetContent className={cn('flex h-[97%] w-full rounded-lg sm:m-2 sm:min-w-xl')}>
                    <SheetHeader className="border-b border-gray-300">
                        <SheetTitle>Create Ticket</SheetTitle>
                        <SheetDescription>Ticket creation via Walk-in</SheetDescription>
                    </SheetHeader>

                    <section
                        className={cn(
                            'grid h-full max-h-[75vh] grid-cols-1 gap-2 overflow-y-auto px-3 sm:grid-cols-2',
                            type === 'account' && 'grid-cols-1 sm:grid-cols-2',
                        )}
                    >
                        <section className="space-y-4 p-2">
                            <Input
                                onChange={(e) => form.setData('consumer_name', e.target.value)}
                                value={form.data.consumer_name}
                                placeholder="Consumer Name"
                                label="Consumer Name"
                                error={form.errors.consumer_name}
                            />
                            <div className="space-y-2">
                                <Input
                                    onChange={(e) => form.setData('caller_name', e.target.value)}
                                    placeholder="Caller Name"
                                    label="Caller Name"
                                    value={form.data.caller_name}
                                    error={form.errors.caller_name}
                                />
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="same-as-consumer"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                form.setData('caller_name', form.data.consumer_name);
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="same-as-consumer" className="text-sm text-gray-600">
                                        Same as Consumer Name
                                    </label>
                                </div>
                            </div>

                            <Input
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="Phone"
                                label="Phone"
                                value={form.data.phone}
                                error={form.errors.phone}
                            />

                            <Input
                                onChange={(e) => form.setData('landmark', e.target.value)}
                                placeholder="Landmark"
                                label="Landmark"
                                value={form.data.landmark}
                                error={form.errors.landmark}
                            />
                            <Input
                                onChange={(e) => form.setData('sitio', e.target.value)}
                                placeholder="Sitio"
                                label="Sitio"
                                value={form.data.sitio}
                                error={form.errors.sitio}
                            />

                            <Select
                                id="district"
                                onValueChange={(value) => {
                                    form.setData('district', value);
                                }}
                                value={form.data.district}
                                label="District"
                                searchable={true}
                                options={townOptions}
                                error={form.errors.district}
                            />

                            {form.data.district && (
                                <Select
                                    id="barangay"
                                    onValueChange={(value) => {
                                        form.setData('barangay', value);
                                    }}
                                    value={form.data.barangay}
                                    label="Barangay"
                                    searchable={true}
                                    options={barangayOptions}
                                    error={form.errors.barangay}
                                />
                            )}
                        </section>
                        <section className="space-y-4 p-2">
                            <Select
                                label="Ticket Type"
                                searchable={true}
                                options={ticketTypeOptions}
                                onValueChange={(value) => form.setData('ticket_type', value)}
                                error={form.errors.ticket_type}
                            />
                            <Select
                                label="Concern Type"
                                searchable={true}
                                options={concernTypeOptions}
                                onValueChange={(value) => form.setData('concern_type', value)}
                                error={form.errors.concern_type}
                            />
                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('concern', e.target.value)}
                                value={form.data.concern}
                                label="Details of Concern"
                                placeholder="Input details of concern for this ticket"
                                error={form.errors.concern}
                            />
                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('reason', e.target.value)}
                                value={form.data.reason}
                                label="Reason"
                                placeholder="Input reason for this ticket"
                                error={form.errors.reason}
                            />

                            <div>
                                <h1 className="mb-1 text-sm font-medium">Severity</h1>
                                <RadioGroup
                                    value={form.data.severity}
                                    onValueChange={(value: string) => form.setData('severity', value)}
                                    className="flex flex-row gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="low" id="severity-low" />
                                        <Label htmlFor="severity-low">Low</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="medium" id="severity-medium" />
                                        <Label htmlFor="severity-medium">Medium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="high" id="severity-high" />
                                        <Label htmlFor="severity-high">High</Label>
                                    </div>
                                </RadioGroup>
                                {form.errors.severity && <p className="mt-1 text-sm text-destructive">{form.errors.severity}</p>}
                            </div>

                            <div>
                                <h1 className="mb-1 text-sm font-medium">Assign To</h1>
                                <RadioGroup
                                    value={form.data.assignation_type}
                                    onValueChange={(value: string) => form.setData('assignation_type', value)}
                                    className="flex flex-row gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="user" id="assign-user" />
                                        <Label htmlFor="assign-user">User</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="department" id="assign-department" />
                                        <Label htmlFor="assign-department">Department</Label>
                                    </div>
                                </RadioGroup>
                                {form.errors.assignation_type && <p className="mt-1 text-sm text-destructive">{form.errors.assignation_type}</p>}
                            </div>

                            {form.data.assignation_type === 'department' ? (
                                <Select
                                    label="Department"
                                    searchable={true}
                                    onValueChange={(value) => form.setData('assign_department_id', value)}
                                    options={roleOptions}
                                    error={form.errors.assign_department_id}
                                />
                            ) : (
                                <SearchUsers onUserSelect={onUserSelect} />
                            )}

                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('remarks', e.target.value)}
                                value={form.data.remarks}
                                label="Remarks"
                                placeholder="Input remarks for this ticket"
                                error={form.errors.remarks}
                            />
                        </section>

                        {type === 'account' && (
                            <section className="rounded-lg border bg-gray-50 p-2">
                                <h1 className="border-b pb-2 text-sm font-medium text-gray-700">Ticket History</h1>

                                <div className="flex h-full items-center justify-center p-4">
                                    <p className="text-sm text-gray-500">No ticket history available</p>
                                </div>
                            </section>
                        )}
                    </section>

                    <SheetFooter className="flex flex-row justify-end border-t border-gray-300 p-2">
                        <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </SheetClose>

                        <AlertDialog
                            title="Are you sure to submit this ticket?"
                            description="Note: this action cannot be undone"
                            onConfirm={() => {
                                submitForm();
                            }}
                        >
                            <Button>Submit Ticket</Button>
                        </AlertDialog>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </main>
    );
}
