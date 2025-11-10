import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import SearchUsers from './search-users';

interface AssignUserProps {
    application: CustomerApplication | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
export default function AssignUser({ application, isOpen, setIsOpen }: AssignUserProps) {
    const form = useForm({
        assign_user_id: '',
    });

    const onUserSelect = (userId: string | number) => {
        form.setData('assign_user_id', userId.toString());
    };

    const handleSubmit = () => {
        form.post(
            route('tickets.assign', {
                application_id: application?.id,
                type: 'user',
            }),
            {
                onSuccess: () => {
                    toast.success('Application assigned successfully');
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search Users</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <SearchUsers onUserSelect={onUserSelect} />

                {form.data.assign_user_id && (
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <AlertDialog
                            title="Assign Application"
                            description="Are you sure you want to assign this application to the selected user?"
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
