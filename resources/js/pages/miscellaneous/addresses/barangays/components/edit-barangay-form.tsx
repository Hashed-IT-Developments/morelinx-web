import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import AddressesDialog from '../../addresses-dialog';
import { BarangayWithTown } from '../../types';

const editBarangaySchema = z.object({
    name: z.string().min(1, 'Barangay name is required').max(255),
    town_id: z.number().min(1, 'Town ID is required'),
    barangay_alias: z.string().min(1, 'Barangay alias is required').max(3, 'Barangay alias must contain exactly 3 letters.'),
});

type EditBarangayForm = z.infer<typeof editBarangaySchema>;

interface EditBarangayFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    barangay: BarangayWithTown | null;
}

export default function EditBarangayForm({ open, onOpenChange, barangay }: EditBarangayFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [aliasError, setAliasError] = React.useState<string | null>(null);
    const [isCheckingAlias, setIsCheckingAlias] = React.useState(false);

    const form = useForm<EditBarangayForm>({
        resolver: zodResolver(editBarangaySchema),
        defaultValues: { name: '', town_id: 0, barangay_alias: '' },
    });

    React.useEffect(() => {
        if (barangay && open) {
            form.reset({
                name: barangay.name,
                town_id: barangay.townId,
                barangay_alias: barangay.barangayAlias,
            });
            setAliasError(null);
        }
    }, [barangay, open, form]);

    // Debounced alias check
    React.useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name !== 'barangay_alias') return;

            const alias = value.barangay_alias;

            if (!alias || alias.length === 0) {
                setAliasError(null);
                return;
            }

            const timeoutId = setTimeout(async () => {
                setIsCheckingAlias(true);
                try {
                    const response = await fetch(
                        route('addresses.check-barangay-alias', {
                            barangay_alias: alias,
                            barangay_id: barangay?.id, // Pass the current
                        }),
                    );
                    const data = await response.json();

                    if (!data.available) {
                        setAliasError('This barangay alias is already in use');
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
    }, [form, barangay?.id]);

    const onSubmit = async (data: EditBarangayForm) => {
        if (!barangay) return;

        if (aliasError) {
            toast.error(aliasError);
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('addresses.update-barangay', barangay.id),
            { ...data, _method: 'PUT' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAliasError(null);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    let errorMessage = 'Failed to update barangay.';
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
        <AddressesDialog open={open} onOpenChange={onOpenChange} title="Edit Barangay" description="Update the barangay information below.">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="town_id"
                        render={({ field }) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {barangay && (
                        <div className="rounded-md border border-border bg-muted/50 p-3">
                            <p className="text-sm">
                                Editing barangay from town <span className="font-bold text-primary">{barangay.townName}</span>
                            </p>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Barangay Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter barangay name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="barangay_alias"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Barangay Alias</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter barangay alias (max 3 characters)" {...field} />
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
                            {isSubmitting ? 'Updating...' : 'Update Barangay'}
                        </Button>
                    </div>
                </form>
            </Form>
        </AddressesDialog>
    );
}
