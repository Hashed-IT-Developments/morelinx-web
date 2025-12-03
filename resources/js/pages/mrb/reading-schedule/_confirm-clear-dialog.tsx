import Button from '@/components/composables/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

interface RouteDetails {
    id: string;
    name: string;
    // customerAccounts: AccountDetail[];
}

interface Props {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    billingMonth: string;
    onClear: () => void;
}

export default function ConfirmClearDialog({ openModal, setOpenModal, billingMonth, onClear }: Props) {
    const onConfirmClear = () => {
        axios.delete(route('mrb.reading.schedule.clear-api', { billing_month: billingMonth })).then((response) => {
            toast.success(response.data.message);
            onClear();
        });

        setOpenModal(false);
    };

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <DialogTitle className="text-xl">Clear Reading Schedule</DialogTitle>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All Reading schedule for this Billing Month will be deleted.</p>
                    </div>
                    <DialogClose />
                </DialogHeader>

                <p className="rounded-lg border-red-500 bg-red-200 p-4 text-red-600">
                    Are you sure you want to clear the reading schedule? This action will remove all the reading schedules for &nbsp;{billingMonth}.{' '}
                    <br />
                    This action cannot be undone.
                </p>

                <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                        <Button variant="default">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={onConfirmClear}>
                        Confirm Clear
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
