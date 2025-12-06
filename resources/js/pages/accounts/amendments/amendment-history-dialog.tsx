import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AmendmentHistory from './amendment-history';

interface Props {
    account: Account;
    isOpen: boolean;
    onClose: () => void;
}

export default function AmendmentHistoryDialog({ account, isOpen, onClose }: Props) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="min-w-5xl">
                <DialogHeader>
                    <DialogTitle>Amendment History</DialogTitle>
                    <DialogDescription>
                        Account: <strong>{account.account_name}</strong> (#{account.account_number})
                    </DialogDescription>
                </DialogHeader>
                <AmendmentHistory account={account} />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
