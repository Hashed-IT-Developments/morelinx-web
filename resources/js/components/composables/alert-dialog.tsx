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

type AlertDialogProps = {
    onConfirm: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
};

export default function AlertDialog({ onConfirm, title, description, children, isOpen, setIsOpen }: AlertDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{children && children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>{description}</AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </Dialog>
    );
}
