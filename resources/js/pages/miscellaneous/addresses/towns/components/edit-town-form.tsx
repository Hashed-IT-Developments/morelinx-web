import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AddressesDialog from '../../addresses-dialog';
import { Town, TownForm, townSchema } from '../../types';

interface EditTownFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    town: Town | null;
}

export default function EditTownForm({ open, onOpenChange, town }: EditTownFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<TownForm>({
        resolver: zodResolver(townSchema),
        defaultValues: { name: '', feeder: '', town_alias: '' },
    });

    React.useEffect(() => {
        if (town && open) {
            form.reset({ name: town.name, feeder: town.feeder || '', town_alias: town.town_alias || '' });
        }
    }, [town, open, form]);

    const onSubmit = async (data: TownForm) => {
        if (!town) return;

        setIsSubmitting(true);
        router.post(
            route('addresses.update-town', town.id),
            { ...data, _method: 'PUT' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                },
                onError: (errors) => {
                    let errorMessage = 'Failed to update town.';
                    if (errors.authorization) errorMessage = errors.authorization;
                    else if (typeof errors === 'object' && errors) {
                        const errorMessages = Object.values(errors).flat();
                        if (errorMessages.length > 0) errorMessage = errorMessages.join(', ');
                    }
                    toast.error(errorMessage);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <AddressesDialog open={open} onOpenChange={onOpenChange} title="Edit Town" description="Update the town information below.">
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

                    <FormField
                        control={form.control}
                        name="town_alias"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Town Alias</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter town alias (max 3 characters)" {...field} />
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
                            {isSubmitting ? 'Updating...' : 'Update Town'}
                        </Button>
                    </div>
                </form>
            </Form>
        </AddressesDialog>
    );
}
