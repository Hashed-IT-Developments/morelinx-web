import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AddressesDialog from '../../addresses-dialog';
import { TownForm, townSchema } from '../../types';

interface CreateTownFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateTownForm({ open, onOpenChange }: CreateTownFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<TownForm>({
        resolver: zodResolver(townSchema),
        defaultValues: { name: '', feeder: '' },
    });

    React.useEffect(() => {
        if (!open) {
            form.reset({ name: '', feeder: '' });
        }
    }, [open, form]);

    const onSubmit = async (data: TownForm) => {
        setIsSubmitting(true);
        router.post(route('addresses.store-town'), data, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset({ name: '', feeder: '' });
                onOpenChange(false);
            },
            onError: (errors) => {
                let errorMessage = 'Failed to create town.';
                if (errors.authorization) errorMessage = errors.authorization;
                else if (typeof errors === 'object' && errors) {
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) errorMessage = errorMessages.join(', ');
                }
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AddressesDialog open={open} onOpenChange={onOpenChange} title="Create Town" description="Add a new town to the system.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Town Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter town name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="feeder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Feeder</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter feeder" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Town'}
                        </Button>
                    </div>
                </form>
            </Form>
        </AddressesDialog>
    );
}
