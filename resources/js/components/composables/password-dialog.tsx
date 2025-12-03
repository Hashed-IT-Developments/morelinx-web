import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Button from './button';
import Input from './input';

interface PasswordDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children?: ReactNode;
    title?: string;
    description?: string;
    onConfirm: () => void;
}

export default function PasswordDialog({ isOpen, setIsOpen, children, title, description, onConfirm }: PasswordDialogProps) {
    const form = useForm({
        password: '',
    });

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const [error, setError] = useState<string | null>(null);

    const handleVerifyPassword = async () => {
        try {
            await axios
                .post(route('password.verify'), { password: form.data.password })
                .then(() => {
                    toast.success('Password verified successfully');
                    onConfirm();
                    setIsOpen(false);
                })
                .catch((error) => {
                    if (error.response && error.response.status === 422) {
                        setError('The provided password is incorrect.');
                    }
                });
        } catch (error) {
            console.error('Password verification failed:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle> {title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleVerifyPassword();
                    }}
                    className="mt-4 flex flex-col gap-2"
                >
                    <Input
                        type="password"
                        placeholder="Enter password"
                        value={form.data.password}
                        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
                        onChange={(e) => form.setData('password', e.target.value)}
                    />
                    {error && <small className="text-xs text-destructive italic">{error}</small>}
                    <Button className="mt-2">Submit</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
