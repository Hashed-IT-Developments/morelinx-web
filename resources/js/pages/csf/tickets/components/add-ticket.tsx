import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { useTicketTypeMethod } from '@/hooks/useTicketTypeMethod';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import SearchUsers from './search-users';

interface AddTicketProps {
    roles: Role[];
    account?: Account | null;
    type: string;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    onClick?: () => void;
}

type FormData = {
    account_id: string;
    account_number: string;
    consumer_name: string;
    caller_name: string;
    district: string;
    landmark: string;
    sitio: string;
    barangay: string;
    phone: string;
    channel: string;
    ticket_type: string;
    concern_type: string;
    concern: string;
    reason: string;
    severity: string;
    assign_department_id: string;
    assign_user: string;
    remarks: string;
    assignation_type: string;
    assign_user_id: string;
    submission_type: string;
    mark_as_completed: boolean;
};

type FormError = Partial<Record<keyof FormData, string>>;

export default function AddTicket({ roles, account, type, isOpen, setOpen, onClick }: AddTicketProps) {
    const defaultForm: FormData = {
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
    };

    const form = useForm<{ tickets: FormData[] }>({ tickets: [{ ...defaultForm }] });
    const [formErrors, setFormErrors] = useState<FormError[]>(form.data.tickets.map(() => ({})));
    const { getTicketTypes } = useTicketTypeMethod();
    const [ticket_types, setTicketTypes] = useState<TicketType[]>([]);
    const [concern_types, setConcernTypes] = useState<TicketType[]>([]);
    const [channels, setChannels] = useState<TicketType[]>([]);
    const [activeTab, setActiveTab] = useState('form-0');

    useEffect(() => {
        const fetchTicketTypes = async () => {
            const ticketTypeResponse = await getTicketTypes({ type: 'ticket_type' });
            setTicketTypes(ticketTypeResponse?.data || []);
            const concernResponse = await getTicketTypes({ type: 'concern_type' });
            setConcernTypes(concernResponse?.data || []);
            const channelResponse = await getTicketTypes({ type: 'channel' });
            setChannels(channelResponse?.data || []);
        };
        fetchTicketTypes();

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, account]);

    const updateFormField = <K extends keyof FormData>(idx: number, key: K, value: FormData[K]) => {
        const newTickets = [...form.data.tickets];
        newTickets[idx][key] = value;
        form.setData('tickets', newTickets);
    };

    const onUserSelect = useCallback((userId: string | number, idx = 0) => {
        updateFormField(idx, 'assign_user_id', userId.toString());
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveTab = (index: number) => {
        const newTickets = [...form.data.tickets];
        newTickets.splice(index, 1);
        form.setData('tickets', newTickets);
        if (newTickets.length === 0) return;
        if (activeTab === `form-${index}`) {
            const newIndex = index === 0 ? 0 : index - 1;
            setActiveTab(`form-${newIndex}`);
        }
    };

    const submitForm = () => {
        form.post(`/tickets/store/`, {
            onSuccess: () => {
                toast.success('Ticket created successfully');
                form.reset();
                setOpen(false);
                setFormErrors(form.data.tickets.map(() => ({})));
            },
            onError: (errors: Record<string, string>) => {
                const ticketsErrors: FormError[] = form.data.tickets.map(() => ({}));
                Object.entries(errors).forEach(([key, value]) => {
                    const match = key.match(/^tickets\.(\d+)\.(.+)$/);
                    if (match) {
                        const idx = Number(match[1]);
                        const field = match[2] as keyof FormData;
                        ticketsErrors[idx][field] = value as string;
                    }
                });
                setFormErrors(ticketsErrors);
            },
        });
    };

    const { towns, barangays } = useTownsAndBarangays(form.data.tickets[0].district || '');
    const townOptions = useMemo(() => (towns || []).map((t) => ({ label: t.name, value: t.id.toString() })), [towns]);
    const barangayOptions = useMemo(() => (barangays || []).map((b) => ({ label: b.name, value: b.id.toString() })), [barangays]);
    const ticketTypeOptions = useMemo(() => (ticket_types || []).map((t) => ({ label: t.name, value: t.id.toString() })), [ticket_types]);
    const concernTypeOptions = useMemo(() => (concern_types || []).map((t) => ({ label: t.name, value: t.id.toString() })), [concern_types]);
    const channelOptions = useMemo(() => (channels || []).map((t) => ({ label: t.name, value: t.id.toString() })), [channels]);
    const roleOptions = useMemo(() => (roles || []).map((r) => ({ label: r.name, value: r.id.toString() })), [roles]);

    useEffect(() => {
        if (isOpen && type === 'account' && account) {
            const newTickets = [...form.data.tickets];
            newTickets[0] = {
                ...newTickets[0],
                account_id: account.id?.toString() || '',
                account_number: account.account_number || '',
                consumer_name: account.account_name || '',
                caller_name: account.account_name || '',
                phone: account.customer_application?.mobile_1 || account.customer_application?.mobile_2 || '',
                barangay: account.barangay_id?.toString() || '',
                district: account.district_id?.toString() || '',
            };
            form.setData('tickets', newTickets);
        }
        if (!isOpen) form.reset();

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, account]);

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

                    <section>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="flex h-full w-full flex-wrap gap-2">
                                {form.data.tickets.map((_, idx) => (
                                    <TabsTrigger value={`form-${idx}`} key={`form-${idx}`} asChild>
                                        <div className="flex items-center">
                                            Form {idx + 1}
                                            {form.data.tickets.length > 1 && (
                                                <AlertDialog
                                                    title="Confirmation"
                                                    description={`Are you sure you want to remove Form no. ${idx + 1}`}
                                                    onConfirm={() => handleRemoveTab(idx)}
                                                >
                                                    <button type="button" className="ml-2 block cursor-pointer text-red-500 hover:text-red-700">
                                                        <X className="z-50 h-8 w-8" />
                                                    </button>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                ))}

                                <TabsTrigger
                                    value=""
                                    className="cursor-pointer hover:opacity-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newIndex = form.data.tickets.length;
                                        const newForm = { ...form.data.tickets[newIndex - 1] };
                                        form.setData('tickets', [...form.data.tickets, newForm]);
                                        setActiveTab(`form-${newIndex}`);
                                    }}
                                >
                                    <Plus /> Add Form
                                </TabsTrigger>
                            </TabsList>

                            {form.data.tickets.map((item, idx) => (
                                <TabsContent
                                    key={idx}
                                    value={`form-${idx}`}
                                    className={cn(
                                        'grid h-full grid-cols-1 gap-4 overflow-y-auto p-2 sm:grid-cols-2',
                                        form.data.tickets.length >= 10 && 'max-h-[70vh]',
                                        form.data.tickets.length >= 15 && 'max-h-[66.5vh]',
                                    )}
                                >
                                    <section className="flex flex-col gap-2">
                                        <Input
                                            value={item.account_number}
                                            onChange={(e) => updateFormField(idx, 'account_number', e.target.value)}
                                            placeholder="Account #"
                                            label="Account #"
                                            readOnly={type === 'account' && !!account}
                                            className={type === 'account' && account ? 'cursor-not-allowed bg-gray-100' : undefined}
                                            error={formErrors[idx]?.account_number}
                                        />
                                        <Input
                                            value={item.consumer_name}
                                            onChange={(e) => updateFormField(idx, 'consumer_name', e.target.value)}
                                            placeholder="Consumer Name"
                                            label="Consumer Name"
                                            error={formErrors[idx]?.consumer_name}
                                        />
                                        <div className="space-y-2">
                                            <Input
                                                value={item.caller_name}
                                                onChange={(e) => updateFormField(idx, 'caller_name', e.target.value)}
                                                placeholder="Caller Name"
                                                label="Caller Name"
                                                error={formErrors[idx]?.caller_name}
                                            />
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) updateFormField(idx, 'caller_name', item.consumer_name);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label>Same as Consumer Name</Label>
                                            </div>
                                        </div>
                                        <Input
                                            value={item.phone}
                                            onChange={(e) => updateFormField(idx, 'phone', e.target.value)}
                                            placeholder="Phone"
                                            label="Phone"
                                            error={formErrors[idx]?.phone}
                                        />
                                        <Input
                                            value={item.landmark}
                                            onChange={(e) => updateFormField(idx, 'landmark', e.target.value)}
                                            placeholder="Landmark"
                                            label="Landmark"
                                            error={formErrors[idx]?.landmark}
                                        />
                                        <Input
                                            value={item.sitio}
                                            onChange={(e) => updateFormField(idx, 'sitio', e.target.value)}
                                            placeholder="Sitio"
                                            label="Sitio"
                                            error={formErrors[idx]?.sitio}
                                        />
                                        <Select
                                            value={item.district}
                                            onValueChange={(val) => updateFormField(idx, 'district', val)}
                                            options={townOptions}
                                            label="District"
                                            searchable
                                            error={formErrors[idx]?.district}
                                        />
                                        {item.district && (
                                            <Select
                                                value={item.barangay}
                                                onValueChange={(val) => updateFormField(idx, 'barangay', val)}
                                                options={barangayOptions}
                                                label="Barangay"
                                                searchable
                                                error={formErrors[idx]?.barangay}
                                            />
                                        )}
                                    </section>

                                    <section className="flex flex-col gap-2">
                                        <Select
                                            value={item.channel}
                                            onValueChange={(val) => updateFormField(idx, 'channel', val)}
                                            options={channelOptions}
                                            label="Channel"
                                            searchable
                                            error={formErrors[idx]?.channel}
                                        />
                                        <Select
                                            value={item.ticket_type}
                                            onValueChange={(val) => updateFormField(idx, 'ticket_type', val)}
                                            options={ticketTypeOptions}
                                            label="Ticket Type"
                                            searchable
                                            error={formErrors[idx]?.ticket_type}
                                        />
                                        <Select
                                            value={item.concern_type}
                                            onValueChange={(val) => updateFormField(idx, 'concern_type', val)}
                                            options={concernTypeOptions}
                                            label="Concern Type"
                                            searchable
                                            error={formErrors[idx]?.concern_type}
                                        />
                                        <Input
                                            value={item.concern}
                                            onChange={(e) => updateFormField(idx, 'concern', e.target.value)}
                                            placeholder="Input details of concern"
                                            label="Details of Concern"
                                            type="textarea"
                                            error={formErrors[idx]?.concern}
                                        />
                                        <Input
                                            value={item.reason}
                                            onChange={(e) => updateFormField(idx, 'reason', e.target.value)}
                                            placeholder="Input reason for this ticket"
                                            label="Reason"
                                            type="textarea"
                                            error={formErrors[idx]?.reason}
                                        />

                                        <div className="col-span-2 flex flex-col gap-2">
                                            <Label>Severity</Label>
                                            <RadioGroup
                                                value={item.severity}
                                                onValueChange={(val) => updateFormField(idx, 'severity', val)}
                                                className="flex flex-row gap-4"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="low" id={`severity-low-${idx}`} />
                                                    <Label htmlFor={`severity-low-${idx}`}>Low</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="medium" id={`severity-medium-${idx}`} />
                                                    <Label htmlFor={`severity-medium-${idx}`}>Medium</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="high" id={`severity-high-${idx}`} />
                                                    <Label htmlFor={`severity-high-${idx}`}>High</Label>
                                                </div>
                                            </RadioGroup>
                                            {formErrors[idx]?.severity && <p className="text-sm text-red-600">{formErrors[idx]?.severity}</p>}
                                        </div>

                                        <Select
                                            value={item.submission_type}
                                            onValueChange={(val) => updateFormField(idx, 'submission_type', val)}
                                            options={[
                                                { label: 'Log', value: 'log' },
                                                { label: 'Ticket', value: 'ticket' },
                                            ]}
                                            label="Submit as"
                                            error={formErrors[idx]?.submission_type}
                                        />

                                        {item.submission_type !== 'log' && (
                                            <div className="col-span-2 flex flex-col gap-2">
                                                <Label>Assign To</Label>
                                                <RadioGroup
                                                    value={item.assignation_type}
                                                    onValueChange={(val) => updateFormField(idx, 'assignation_type', val)}
                                                    className="flex flex-row gap-4"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="user" id={`assign-user-${idx}`} />
                                                        <Label htmlFor={`assign-user-${idx}`}>User</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="department" id={`assign-department-${idx}`} />
                                                        <Label htmlFor={`assign-department-${idx}`}>Department</Label>
                                                    </div>
                                                </RadioGroup>

                                                {item.assignation_type === 'department' ? (
                                                    <Select
                                                        value={item.assign_department_id}
                                                        onValueChange={(val) => updateFormField(idx, 'assign_department_id', val)}
                                                        options={roleOptions}
                                                        label="Department"
                                                        searchable
                                                        error={formErrors[idx]?.assign_department_id}
                                                    />
                                                ) : (
                                                    <SearchUsers
                                                        onUserSelect={(id) => onUserSelect(id, idx)}
                                                        error={formErrors[idx]?.assign_user_id}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <Input
                                            value={item.remarks}
                                            onChange={(e) => updateFormField(idx, 'remarks', e.target.value)}
                                            placeholder="Input remarks for this ticket"
                                            label="Remarks"
                                            type="textarea"
                                            className="col-span-2"
                                            error={formErrors[idx]?.remarks}
                                        />

                                        {item.submission_type === 'log' && (
                                            <div className="col-span-2 flex items-center gap-3">
                                                <Checkbox
                                                    checked={item.mark_as_completed}
                                                    onCheckedChange={(checked) => updateFormField(idx, 'mark_as_completed', !!checked)}
                                                />
                                                <Label>Mark as Completed</Label>
                                                {formErrors[idx]?.mark_as_completed && (
                                                    <p className="text-sm text-red-600">{formErrors[idx]?.mark_as_completed}</p>
                                                )}
                                            </div>
                                        )}
                                    </section>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </section>

                    <SheetFooter className="flex flex-row justify-end border-t border-gray-300 p-2">
                        <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </SheetClose>
                        <AlertDialog
                            title="Are you sure to submit these tickets?"
                            description="Note: this action cannot be undone"
                            onConfirm={submitForm}
                        >
                            <Button>Submit</Button>
                        </AlertDialog>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </main>
    );
}
