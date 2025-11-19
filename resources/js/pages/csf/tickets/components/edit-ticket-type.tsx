import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface EditTicketTypeProps {
    isOpenEditTicketType: boolean;
    setIsOpenEditTicketType: (open: boolean) => void;
    ticket: TicketType;
    type: string;
}

export default function EditTicketType({ isOpenEditTicketType, setIsOpenEditTicketType, ticket, type }: EditTicketTypeProps) {
    const form = useForm({
        id: ticket?.id,
        name: ticket?.name,
        type: type,
    });

    const onSubmit = useCallback(() => {
        form.put(`/tickets/settings/ticket/${type}/edit`, {
            onSuccess: () => {
                setIsOpenEditTicketType(false);
                toast.success('Ticket type updated successfully');
            },
            onError: (error: { message?: string }) => {
                toast.error('Failed to update ticket type' + (error?.message ? `: ${error.message}` : ''));
            },
            onFinish: () => {
                form.reset();
            },
        });
    }, [form, type, setIsOpenEditTicketType]);

    const formattedType = type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <main>
            <Dialog open={isOpenEditTicketType} onOpenChange={setIsOpenEditTicketType}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {formattedType}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    {ticket && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Current Name</label>
                                <div className="rounded bg-gray-100 px-3 py-2 text-gray-800">{ticket.name}</div>
                            </div>
                            <Input
                                label="New Ticket Type Name"
                                id="ticket-type-name"
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                className="w-full"
                                placeholder="Enter new ticket type name"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={onSubmit} disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
