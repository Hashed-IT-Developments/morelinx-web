import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AddressesDialog from '../../addresses-dialog';
import { BarangayForm, barangaySchema, Town } from '../../types';

interface CreateBarangayFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    town: Town | null;
}

export default function CreateBarangayForm({ open, onOpenChange, town }: CreateBarangayFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<BarangayForm>({
        resolver: zodResolver(barangaySchema),
        defaultValues: { town_id: 0, barangays: [{ name: '' }] },
    });

    const watchedBarangays = form.watch('barangays') || [];

    React.useEffect(() => {
        if (town && open) {
            form.reset({ town_id: town.id, barangays: [{ name: '' }] });
        }
    }, [town, open, form]);

    const addBarangay = () => {
        const currentBarangays = form.getValues('barangays') || [];
        form.setValue('barangays', [...currentBarangays, { name: '' }]);
    };

    const removeBarangay = (index: number) => {
        const currentBarangays = form.getValues('barangays') || [];
        if (currentBarangays.length > 1) {
            const newBarangays = currentBarangays.filter((_, i) => i !== index);
            form.setValue('barangays', newBarangays);
        }
    };

    const onSubmit = async (data: BarangayForm) => {
        setIsSubmitting(true);
        router.post(route('addresses.store-barangay'), data, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset({ town_id: 0, barangays: [{ name: '' }] });
                onOpenChange(false);
            },
            onError: (errors) => {
                let errorMessage = 'Failed to create barangay(s).';
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
        <AddressesDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Add Barangay to ${town?.name || 'Town'}`}
            description="Add one or more barangays to this town."
        >
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

                    <div className="rounded-md border border-border bg-muted/50 p-3">
                        <p className="text-sm">
                            Adding <strong>{watchedBarangays.length}</strong> barangay{watchedBarangays.length > 1 ? 's' : ''} to{' '}
                            <span className="font-bold text-primary">{town?.name}</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel>Barangay Names</FormLabel>
                            <Button type="button" variant="outline" size="sm" onClick={addBarangay} className="shrink-0">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Another
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {watchedBarangays.map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name={`barangays.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder={`Enter barangay name ${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {watchedBarangays.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeBarangay(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {index < watchedBarangays.length - 1 && <Separator />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : `Create ${watchedBarangays.length} Barangay${watchedBarangays.length > 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </form>
            </Form>
        </AddressesDialog>
    );
}
