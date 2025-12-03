'use client';

import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialog as Dialog,
} from '@/components/ui/alert-dialog';
import Input from './input';

type AlertDialogProps = {
    onConfirm: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    setRemarks?: (remarks: string) => void;
};

export default function AlertDialog({ onConfirm, title, description, children, isOpen, setIsOpen, setRemarks }: AlertDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{children && children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>{description}</AlertDialogDescription>

                {setRemarks && (
                    <div className="mt-4">
                        <Input
                            type="textarea"
                            label="Remarks"
                            placeholder="Enter remarks here"
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setRemarks(e.target.value)}
                        ></Input>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </Dialog>
    );
}
