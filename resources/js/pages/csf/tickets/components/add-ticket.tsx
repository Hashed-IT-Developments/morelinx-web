import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Plus } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import AlertDialog from '@/components/composables/alert-dialog';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import moment from 'moment';

export default function AddTicket({ roles, account, type, isOpen, setOpen, onClick }: AddTicketProps) {
    const form = useForm({
        account_id: '',
        account_number: '',
        consumer_name: '',
        caller_name: '',
        district: '',
        landmark: '',
        sitio: '',
        barangay: '',
        phone: '',
        channel: '',
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
        submission_type: 'ticket',
        mark_as_completed: false,
    });

    const { getTicketTypes } = useTicketTypeMethod();

    const [ticket_types, setTicketTypes] = useState<TicketType[]>([]);
    const [concern_types, setConcernTypes] = useState<TicketType[]>([]);
    const [channels, setChannels] = useState<TicketType[]>([]);

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const ticketTypeResponse = await getTicketTypes({ type: 'ticket_type' });
                setTicketTypes(ticketTypeResponse.data);
                const concernResponse = await getTicketTypes({ type: 'concern_type' });
                setConcernTypes(concernResponse.data);
                const channelResponse = await getTicketTypes({ type: 'channel' });
                setChannels(channelResponse.data);
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

    const channelOptions = useMemo(
        () =>
            channels?.map((channel) => ({
                label: channel.name,
                value: channel.id.toString(),
            })) || [],
        [channels],
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
                    const errorValues = Object.values(errors);
                    if (errorValues.length > 3) {
                        toast.error('Failed to create ticket: Please check the fields and try again.');
                    } else {
                        errorValues.forEach((err) => {
                            toast.error('Failed to create ticket: ' + err);
                        });
                    }
                } else {
                    toast.error('Failed to create ticket');
                }
            },
        });
    };

    useEffect(() => {
        if (isOpen && type === 'account' && account) {
            form.setData((data) => ({
                ...data,
                account_id: account.id?.toString() || '',
                account_number: account.account_number || '',
                consumer_name: account.account_name || '',
                caller_name: account.account_name || '',
                phone: account.application.mobile_1 || account.application.mobile_2 || '',
                barangay: account.barangay_id?.toString() || '',
                district: account.district_id?.toString() || '',
            }));
        }
        if (!isOpen) {
            form.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, account]);

    useEffect(() => {
        if (form.data.submission_type === 'log') {
            form.setData((data) => ({
                ...data,
                assignation_type: '',
                assign_department_id: '',
                assign_user_id: '',
            }));
        } else if (form.data.submission_type === 'ticket') {
            form.setData((data) => ({
                ...data,
                assignation_type: 'user',
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.submission_type]);

    return (
        <main>
            <Sheet open={isOpen} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" shape="rounded" onClick={onClick}>
                        {type === 'walk-in' ? 'Create Custom Ticket' : 'Create Account Ticket'} <Plus />
                    </Button>
                </SheetTrigger>
                <SheetContent className={cn('flex h-[97%] w-full gap-0 rounded-lg sm:m-2 sm:min-w-xl')}>
                    <SheetHeader className="border-b border-gray-300">
                        <SheetTitle>{type === 'walk-in' ? 'Create Custom Ticket' : 'Create Account Ticket'}</SheetTitle>
                        <SheetDescription>{type === 'walk-in' ? 'Custom Ticket creation' : 'Ticket creation via Account'}</SheetDescription>
                    </SheetHeader>

                    <section
                        className={cn(
                            'grid h-full max-h-[90vh] grid-cols-1 gap-2 overflow-y-auto px-3 pb-4 sm:grid-cols-2',
                            type === 'account' && 'grid-cols-1 sm:grid-cols-2',
                        )}
                    >
                        <section className="space-y-4 p-2">
                            <Input
                                onChange={(e) => form.setData('account_number', e.target.value)}
                                value={form.data.account_number}
                                placeholder="Account #"
                                label="Account #"
                                error={form.errors.account_number}
                                readOnly={type === 'account' && !!account}
                                className={type === 'account' && account ? 'cursor-not-allowed bg-gray-100' : undefined}
                            />
                            <Input
                                required
                                onChange={(e) => form.setData('consumer_name', e.target.value)}
                                value={form.data.consumer_name}
                                placeholder="Consumer Name"
                                label="Consumer Name"
                                error={form.errors.consumer_name}
                            />
                            <div className="space-y-2">
                                <Input
                                    required
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
                                required
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
                                required
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
                                    required
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
                                required
                                label="Channel"
                                searchable={true}
                                options={channelOptions}
                                onValueChange={(value) => form.setData('channel', value)}
                                error={form.errors.channel}
                            />
                            <Select
                                required
                                label="Ticket Type"
                                searchable={true}
                                options={ticketTypeOptions}
                                onValueChange={(value) => form.setData('ticket_type', value)}
                                error={form.errors.ticket_type}
                            />
                            <Select
                                required
                                label="Concern Type"
                                searchable={true}
                                options={concernTypeOptions}
                                onValueChange={(value) => form.setData('concern_type', value)}
                                error={form.errors.concern_type}
                            />
                            <Input
                                required
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

                            <Select
                                label="Submit as"
                                onValueChange={(value) => form.setData('submission_type', value)}
                                defaultValue="ticket"
                                options={[
                                    { label: 'Log', value: 'log' },
                                    { label: 'Ticket', value: 'ticket' },
                                ]}
                                error={form.errors.submission_type}
                            />

                            {form.data.submission_type !== 'log' && (
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
                            )}

                            {form.data.submission_type !== 'log' &&
                                (form.data.assignation_type === 'department' ? (
                                    <Select
                                        label="Department"
                                        searchable={true}
                                        onValueChange={(value) => form.setData('assign_department_id', value)}
                                        options={roleOptions}
                                        error={form.errors.assign_department_id}
                                    />
                                ) : (
                                    <SearchUsers onUserSelect={onUserSelect} />
                                ))}

                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('remarks', e.target.value)}
                                value={form.data.remarks}
                                label="Remarks"
                                placeholder="Input remarks for this ticket"
                                error={form.errors.remarks}
                            />

                            {form.data.submission_type === 'log' && (
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="mark_as_completed"
                                        checked={form.data.mark_as_completed}
                                        onCheckedChange={(checked) => form.setData('mark_as_completed', !!checked)}
                                    />
                                    <Label htmlFor="mark_as_completed">Mark as Completed</Label>
                                </div>
                            )}
                        </section>

                        {type === 'account' && (
                            <section className="col-span-2 rounded-lg border bg-gray-50 p-2">
                                <h1 className="border-b pb-2 text-sm font-medium text-gray-700">Ticket History</h1>

                                {account && account?.tickets ? (
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr>
                                                <th className="border-b px-2 py-1 text-left text-sm font-medium text-gray-600">Ticket #</th>
                                                <th className="border-b px-2 py-1 text-left text-sm font-medium text-gray-600">Status</th>
                                                <th className="border-b px-2 py-1 text-left text-sm font-medium text-gray-600">Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {account?.tickets?.map((ticket) => (
                                                <tr
                                                    key={ticket.id}
                                                    className="cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        router.get('/tickets/view?ticket_id=' + ticket.id);
                                                    }}
                                                >
                                                    <td className="border-b px-2 py-1 text-sm text-gray-700">{ticket.ticket_no}</td>

                                                    <td className="border-b px-2 py-1 text-sm text-gray-700">{ticket.status}</td>
                                                    <td className="border-b px-2 py-1 text-sm text-gray-700">
                                                        {moment(ticket.created_at).format('MMM DD, YYYY hh:mm A')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-600">No ticket history available for this account.</p>
                                )}
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
                            <Button>Submit</Button>
                        </AlertDialog>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </main>
    );
}
