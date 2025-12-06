import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import Select from '@/components/composables/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import AlertDialog from '@/components/composables/alert-dialog';
import { useTicketTypeMethod } from '@/hooks/useTicketTypeMethod';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import SearchUsers from './search-users';

interface UpdateTicketProps {
    ticket?: Ticket | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
export default function UpdateTicket({ ticket, isOpen, setIsOpen }: UpdateTicketProps) {
    const { getTicketTypes } = useTicketTypeMethod();
    const [actual_findings_types, setActualFindingsTypes] = useState<TicketType[]>([]);

    const actualFindingsOptions = useMemo(
        () =>
            actual_findings_types.map((type) => ({
                label: type.name,
                value: type.id.toString(),
            })),
        [actual_findings_types],
    );

    const form = useForm({
        id: '',
        actual_findings_id: '',
        severity: '',
        action_plan: '',
        remarks: '',
        status: '',
        resolved_by_id: '',
    });

    useEffect(() => {
        if (ticket) {
            form.setData({
                id: ticket.id,
                actual_findings_id: ticket.details.actual_findings_id || '',
                severity: ticket.severity || '',
                action_plan: ticket.details.action_plan || '',
                remarks: ticket.details.remarks || '',
                status: ticket.status || '',
                resolved_by_id: ticket.resolved_by_id ? ticket.resolved_by_id.toString() : '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticket]);

    const handleSetFormData = (field: string, value: string | number) => {
        form.setData(field as keyof typeof form.data, value.toString());
    };

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const response = await getTicketTypes({ type: 'actual_findings_type' });

                setActualFindingsTypes(response.data);
            } catch (error) {
                console.error('Failed to fetch ticket types:', error);
            }
        };
        fetchTicketTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ticket]);

    const handleSubmitForm = () => {
        form.put(route('tickets.update'), {
            onSuccess: () => {
                toast.success('Ticket updated successfully');
                setIsOpen(false);
            },
            onError: (errors) => {
                console.error('Failed to update ticket:', errors);
                toast.error('Failed to update ticket');
            },
        });
    };
    return (
        <main>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="m-2 h-[97%] gap-0 rounded-xl">
                    <SheetHeader className="gap-0 border-b border-gray-300">
                        <SheetTitle>{ticket?.cust_information.consumer_name}</SheetTitle>
                        <SheetDescription>{ticket?.ticket_no}</SheetDescription>
                    </SheetHeader>

                    <section className="mt-2 max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto px-4">
                        <Select
                            label="Actual Findings"
                            value={form.data.actual_findings_id}
                            onValueChange={(value) => handleSetFormData('actual_findings_id', value)}
                            searchable={true}
                            options={actualFindingsOptions}
                        />
                        <Select
                            label="Severity"
                            value={form.data.severity}
                            onValueChange={(value) => handleSetFormData('severity', value)}
                            searchable={true}
                            options={[
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                                { label: 'Critical', value: 'critical' },
                                { label: 'Very Low', value: 'very_low' },
                                { label: 'Very High', value: 'very_high' },
                                { label: 'Emergency', value: 'emergency' },
                            ]}
                        />

                        <Input
                            type="textarea"
                            value={form.data.action_plan}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSetFormData('action_plan', e.target.value)}
                            label="Action plan to be taken"
                            placeholder="Add plan to be taken"
                        />

                        <Select
                            label="Status"
                            value={form.data.status}
                            onValueChange={(value) => handleSetFormData('status', value)}
                            options={[
                                { label: 'Pending', value: 'pending' },
                                { label: 'Unresolved', value: 'unresolved' },
                                { label: 'Resolved', value: 'resolved' },
                                { label: 'Completed', value: 'completed' },
                            ]}
                        />

                        <SearchUsers label="Resolved By" onUserSelect={(value) => handleSetFormData('resolved_by_id', value)} />

                        <Input
                            type="textarea"
                            value={form.data.remarks}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSetFormData('remarks', e.target.value)}
                            label="Remarks"
                            placeholder="Remarks"
                        />
                    </section>

                    <SheetFooter className="grid grid-cols-2 border-t border-gray-300">
                        <Button variant="outline">Cancel</Button>
                        <AlertDialog
                            title="Update Ticket"
                            description="Are you sure you want to update this ticket?"
                            onConfirm={() => {
                                handleSubmitForm();
                            }}
                        >
                            <Button mode="success">Update Ticket</Button>
                        </AlertDialog>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </main>
    );
}
