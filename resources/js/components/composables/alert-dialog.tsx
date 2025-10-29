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
};

export default function AlertDialog({ onConfirm, title, description, children }: AlertDialogProps) {
    return (
        <Dialog>
            <AlertDialogTrigger asChild>{typeof children === 'string' ? <span>{children}</span> : children}</AlertDialogTrigger>
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
