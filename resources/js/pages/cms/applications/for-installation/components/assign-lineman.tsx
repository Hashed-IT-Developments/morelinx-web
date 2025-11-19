import AlertDialog from '@/components/composables/alert-dialog';
import Button from '@/components/composables/button';
import Input from '@/components/composables/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import SearchUsers from './search-users';

interface AssignUserProps {
    application: CustomerApplication | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
export default function AssignLineman({ application, isOpen, setIsOpen }: AssignUserProps) {
    const form = useForm({
        assign_user_id: '',
        remarks: '',
    });

    const [isOpenAlertDialog, setIsOpenAlertDialog] = useState(isOpen);

    const onUserSelect = (userId: string | number) => {
        form.setData('assign_user_id', userId.toString());
    };

    const handleSubmit = () => {
        form.post(
            route('lineman.assign', {
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
        <main>
            <AlertDialog
                isOpen={isOpenAlertDialog}
                setIsOpen={setIsOpenAlertDialog}
                title="Assign Application"
                description="Are you sure you want to assign this application to the selected user?"
                onConfirm={handleSubmit}
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Search Users</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <SearchUsers onUserSelect={onUserSelect} roles={['lineman']} />
                    <Input
                        type="textarea"
                        label="Remarks"
                        value={form.data.remarks}
                        placeholder="Add Remarks"
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => form.setData('remarks', e.target.value)}
                    />

                    {form.data.assign_user_id && (
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="default"
                                onClick={() => {
                                    setIsOpenAlertDialog(true);
                                }}
                            >
                                Submit
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
