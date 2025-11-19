import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import SearchRoles from './search-roles';

interface AssignTicketDepartmentProps {
    ticket: Ticket | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
export default function AssignTicketDepartment({ ticket, isOpen, setIsOpen }: AssignTicketDepartmentProps) {
    const form = useForm({
        assign_department_id: '',
    });

    const onDepartmentSelect = (departmentId: string | number) => {
        form.setData('assign_department_id', departmentId.toString());
    };

    const handleSubmit = () => {
        form.post(
            route('tickets.assign', {
                ticket_id: ticket?.id,
                type: 'department',
            }),
            {
                onSuccess: () => {
                    toast.success('Ticket assigned successfully');
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search Department</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <SearchRoles onRoleSelect={onDepartmentSelect} />

                {form.data.assign_department_id && (
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <AlertDialog
                            title="Assign Ticket"
                            description="Are you sure you want to assign this ticket to the selected user?"
                            onConfirm={handleSubmit}
                        >
                            <Button variant="default">Submit</Button>
                        </AlertDialog>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
