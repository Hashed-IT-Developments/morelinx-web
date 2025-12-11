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
import Button from './button';
import Input from './input';

type AlertDialogProps = {
    onConfirm: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    setRemarks?: (remarks: string) => void;
    mode?: 'success' | 'danger' | 'warning' | 'info';
};

const modeColors: Record<NonNullable<AlertDialogProps['mode']>, string> = {
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
};

export default function AlertDialog({ onConfirm, title, description, children, isOpen, setIsOpen, setRemarks, mode = 'info' }: AlertDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{children && children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={mode ? modeColors[mode] : ''}>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {setRemarks && (
                    <div className="mt-4">
                        <Input
                            type="textarea"
                            label="Remarks"
                            placeholder="Enter remarks here"
                            onChange={(e) => setRemarks(e.target.value.toString())}
                        />
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild onClick={onConfirm}>
                        <Button mode={mode}> Confirm</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </Dialog>
    );
}
