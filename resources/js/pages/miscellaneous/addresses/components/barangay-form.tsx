import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BarangayForm, BarangayWithTown } from '../types';

interface BarangayFormProps {
    form: UseFormReturn<BarangayForm>;
    onSubmit: (data: BarangayForm) => void;
    isSubmitting: boolean;
    editingBarangay: BarangayWithTown | null;
    onCancelEdit: () => void;
    selectedTownId: number | null;
    selectedTownName: string;
}

export default function BarangayFormComponent({
    form,
    onSubmit,
    isSubmitting,
    editingBarangay,
    onCancelEdit,
    selectedTownId,
    selectedTownName,
}: BarangayFormProps) {
    const watchedBarangays = form.watch('barangays') || [];

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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Hidden field for town_id */}
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

                {/* Display text showing which town */}
                {selectedTownId && (
                    <div className="rounded-md border border-border bg-muted/50 p-3">
                        <p className="text-sm font-medium">
                            {editingBarangay ? (
                                <>
                                    Editing barangay <span className="font-bold text-primary">{editingBarangay.name}</span> from town <span className="font-bold text-primary">{selectedTownName}</span>
                                </>
                            ) : (
                                <>
                                    Adding <strong>{watchedBarangays.length}</strong> barangay(s) into <span className="font-bold text-primary">{selectedTownName}</span>
                                </>
                            )}
                        </p>
                    </div>
                )}

                {!selectedTownId && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                        <p className="text-sm text-yellow-800">
                            Click "Add Barangay" or "Edit Barangay" button from the tables below to CREATE or UPDATE a barangay.
                        </p>
                    </div>
                )}

                {/* Barangay Entries */}
                {selectedTownId && !editingBarangay && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel>Barangay Names</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addBarangay}
                                className="shrink-0"
                            >
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
                                                            <Input
                                                                placeholder={`Enter barangay name ${index + 1}`}
                                                                {...field}
                                                            />
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
                )}

                {/* Single barangay edit mode */}
                {editingBarangay && (
                    <FormField
                        control={form.control}
                        name="barangays.0.name"
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
                )}

                <div className="flex justify-end gap-2">
                    {editingBarangay ? (
                        <Button type="button" variant="outline" onClick={onCancelEdit}>
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset({ town_id: 0, barangays: [{ name: '' }] });
                                onCancelEdit();
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || !selectedTownId}>
                        {isSubmitting
                            ? editingBarangay
                                ? 'Updating...'
                                : 'Creating...'
                            : editingBarangay
                              ? 'Update Barangay'
                              : `Create ${watchedBarangays.length} Barangay${watchedBarangays.length > 1 ? 's' : ''}`}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
