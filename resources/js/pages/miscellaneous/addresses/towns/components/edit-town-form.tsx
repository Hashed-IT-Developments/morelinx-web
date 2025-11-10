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
    const [aliasError, setAliasError] = React.useState<string | null>(null);
    const [isCheckingAlias, setIsCheckingAlias] = React.useState(false);

    const form = useForm<TownForm>({
        resolver: zodResolver(townSchema),
        defaultValues: { name: '', feeder: '', alias: '' },
    });

    React.useEffect(() => {
        if (town && open) {
            form.reset({ name: town.name, feeder: town.feeder || '', alias: town.alias || '' });
            setAliasError(null);
        }
    }, [town, open, form]);

    // Debounced alias check
    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name !== 'alias') return;

            const alias = value.alias;

            if (!alias || alias.length === 0) {
                setAliasError(null);
                return;
            }

            const timeoutId = setTimeout(async () => {
                setIsCheckingAlias(true);
                try {
                    const response = await fetch(
                        route('addresses.check-town-alias', {
                            alias: alias,
                            town_id: town?.id, // Pass the current town ID
                        }),
                    );
                    const data = await response.json();

                    if (!data.available) {
                        setAliasError('This alias is already in use');
                    } else {
                        setAliasError(null);
                    }
                } catch (error) {
                    console.error('Error checking alias:', error);
                } finally {
                    setIsCheckingAlias(false);
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        });

        return () => subscription.unsubscribe();
    }, [form, town?.id]);

    const onSubmit = async (data: TownForm) => {
        if (!town) return;

        // Prevent submission if alias is already taken
        if (aliasError) {
            toast.error(aliasError);
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('addresses.update-town', town.id),
            { ...data, _method: 'PUT' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAliasError(null);
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
                        name="alias"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Alias</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter alias (max 3 characters)" {...field} />
                                </FormControl>
                                {aliasError && <p className="text-sm font-medium text-destructive">{aliasError}</p>}
                                {isCheckingAlias && <p className="text-sm text-muted-foreground">Checking availability...</p>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !!aliasError || isCheckingAlias}>
                            {isSubmitting ? 'Updating...' : 'Update Town'}
                        </Button>
                    </div>
                </form>
            </Form>
        </AddressesDialog>
    );
}
