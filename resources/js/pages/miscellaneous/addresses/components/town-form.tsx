import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Town, TownForm } from '../types';

interface TownFormProps {
    form: UseFormReturn<TownForm>;
    onSubmit: (data: TownForm) => void;
    isSubmitting: boolean;
    editingTown: Town | null;
    onCancelEdit: () => void;
}

export default function TownFormComponent({
    form,
    onSubmit,
    isSubmitting,
    editingTown,
    onCancelEdit,
}: TownFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
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
                </div>

                <div className="flex justify-end gap-2">
                    {editingTown ? (
                        <Button type="button" variant="outline" onClick={onCancelEdit}>
                            Cancel Editing
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Clear
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? editingTown
                                ? 'Updating...'
                                : 'Creating...'
                            : editingTown
                              ? 'Update Town'
                              : 'Create Town'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
