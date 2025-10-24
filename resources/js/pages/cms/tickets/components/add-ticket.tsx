import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';

import { Footprints } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import AlertDialog from '@/components/composables/alert-dialog';
import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface AddTicketProps {
    ticket_types: TicketType[];
    concern_types: TicketType[];
    roles: Role[];
    selectedAccountId: string;
    type: string;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    onClick?: () => void;
}

export default function AddTicket({ ticket_types, concern_types, roles, selectedAccountId, type, isOpen, setOpen, onClick }: AddTicketProps) {
    const form = useForm({
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
        assign_department: '',
        assign_user: '',
        remarks: '',
    });

    const { towns, barangays } = useTownsAndBarangays(form.data.district);

    const submitForm = () => {
        form.post('/tickets/walk-in/submit', {
            onSuccess: (response) => {
                const flash = (response.props.flash as { success?: string }) || {};
                toast.success('Ticket created successfully' + (flash.success ? `: ${flash.success}` : ''));
            },
            onError: (errors) => {
                toast.error('Failed to create ticket' + (errors ? `: ${errors}` : ''));
            },
            onFinish: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    const fetchAccountDetails = () => {};

    useEffect(() => {
        if (type === 'account' && selectedAccountId) {
            fetchAccountDetails();
        }
    }, [type, selectedAccountId]);

    return (
        <main>
            <Sheet open={isOpen} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" onClick={onClick}>
                        Create Walk-in <Footprints />
                    </Button>
                </SheetTrigger>
                <SheetContent className={cn('m-2 h-[97%] w-full rounded-lg', type === 'account' && 'sm:min-w-4xl')}>
                    <SheetHeader className="border-gay-300 border-b">
                        <SheetTitle>Create Ticket</SheetTitle>
                        <SheetDescription>Ticket creation via Walk-in</SheetDescription>
                    </SheetHeader>

                    <section className={cn('grid h-full grid-cols-2 gap-2 px-3', type === 'account' && 'grid-cols-1 sm:grid-cols-2')}>
                        <section className="space-y-4 p-2">
                            <Input
                                onChange={(e) => form.setData('consumer_name', e.target.value)}
                                placeholder="Consumer Name"
                                label="Consumer Name"
                            />
                            <Input onChange={(e) => form.setData('caller_name', e.target.value)} placeholder="Caller Name" label="Caller Name" />
                            <Input onChange={(e) => form.setData('phone', e.target.value)} placeholder="Phone" label="Phone" />

                            <Input onChange={(e) => form.setData('landmark', e.target.value)} placeholder="Landmark" label="Landmark" />
                            <Input onChange={(e) => form.setData('sitio', e.target.value)} placeholder="Sitio" label="Sitio" />

                            <Select
                                id="district"
                                onValueChange={(value) => {
                                    form.setData('district', value);
                                }}
                                value={form.data.district}
                                label="District"
                                searchable={true}
                                options={towns.map((town) => ({
                                    label: town.name,
                                    value: town.id.toString(),
                                }))}
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
                                    options={barangays.map((barangay) => ({
                                        label: barangay.name,
                                        value: barangay.id.toString(),
                                    }))}
                                />
                            )}
                        </section>
                        <section className="space-y-4 p-2">
                            <Select
                                label="Ticket Type"
                                searchable={true}
                                options={ticket_types?.map((type) => ({
                                    label: type.name,
                                    value: type.id.toString(),
                                }))}
                                onValueChange={(value) => form.setData('ticket_type', value)}
                            />
                            <Select
                                label="Concern Type"
                                searchable={true}
                                options={concern_types?.map((type) => ({
                                    label: type.name,
                                    value: type.id.toString(),
                                }))}
                                onValueChange={(value) => form.setData('concern_type', value)}
                            />
                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('concern', e.target.value)}
                                value={form.data.concern}
                                label="Details of Concern"
                                placeholder="Input details of concern for this ticket"
                            />
                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('reason', e.target.value)}
                                value={form.data.reason}
                                label="Reason"
                                placeholder="Input reason for this ticket"
                            />
                            <Select
                                label="Assign to Department"
                                searchable={true}
                                onValueChange={(value) => form.setData('assign_department', value)}
                                options={roles?.map((role) => ({
                                    label: role.name,
                                    value: role.name,
                                }))}
                            />
                            <Input
                                type="textarea"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('remarks', e.target.value)}
                                value={form.data.remarks}
                                label="Remarks"
                                placeholder="Input remarks for this ticket"
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
