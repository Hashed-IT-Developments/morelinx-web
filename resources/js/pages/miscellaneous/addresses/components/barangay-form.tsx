import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
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
                                        Editing barangay <span className="font-bold text-primary">{editingBarangay.name}</span> from town{' '}
                                        <span className="font-bold text-primary">{selectedTownName}</span>
                                    </>
                                ) : (
                                    <>
                                        Adding barangay into <span className="font-bold text-primary">{selectedTownName}</span>
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
                </div>

                <div className="flex justify-end gap-2">
                    {editingBarangay ? (
                        <Button type="button" variant="outline" onClick={onCancelEdit}>
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Clear
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || !selectedTownId}>
                        {isSubmitting ? (editingBarangay ? 'Updating...' : 'Creating...') : editingBarangay ? 'Update Barangay' : 'Create Barangay'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
