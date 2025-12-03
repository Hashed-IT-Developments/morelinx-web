import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ContractForm } from './contract-types';

interface ContractFormProps {
    form: UseFormReturn<ContractForm>;
    onSubmit: (data: ContractForm) => void;
    isSubmitting: boolean;
    customerName: string;
    contractId: number | undefined;
}

export default function ContractFormComponent({ form, onSubmit, isSubmitting, customerName, contractId }: ContractFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Deposit Receipt */}
                    <FormField
                        control={form.control}
                        name="deposit_receipt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Deposit Receipt</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter deposit receipt" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select contract type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="New Connection">New Connection</SelectItem>
                                        <SelectItem value="Change of Service">Change of Service</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Entered Date */}
                    <FormField
                        control={form.control}
                        name="entered_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Entered Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Done At */}
                    <FormField
                        control={form.control}
                        name="done_at"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Place of Contract Execution</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter place of execution" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* By Personnel */}
                    <FormField
                        control={form.control}
                        name="by_personnel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>By Personnel</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter personnel name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* By Personnel Position */}
                    <FormField
                        control={form.control}
                        name="by_personnel_position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel required>Personnel Position</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter personnel position" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Customer Application Name Section */}
                <div className="space-y-4 rounded-md border border-border p-4">
                    <h3 className="font-semibold">Customer: {customerName}</h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* ID No 1 */}
                        <FormField
                            control={form.control}
                            name="id_no_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>ID Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter ID number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Issued By 1 */}
                        <FormField
                            control={form.control}
                            name="issued_by_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Issued By</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter issuing authority" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Valid Until 1 */}
                        <FormField
                            control={form.control}
                            name="valid_until_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Valid Until</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Building Owner Section */}
                <div className="space-y-4 rounded-md border border-border p-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Building Owner */}
                        <FormField
                            control={form.control}
                            name="building_owner"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Building Owner</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter building owner name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* ID No 2 */}
                        <FormField
                            control={form.control}
                            name="id_no_2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>ID Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter ID number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Issued By 2 */}
                        <FormField
                            control={form.control}
                            name="issued_by_2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Issued By</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter issuing authority" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Valid Until 2 */}
                        <FormField
                            control={form.control}
                            name="valid_until_2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Valid Until</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-2">
                    <a href={route('contracts.show', contractId)} className="rounded border-2 px-4" target="_blank">
                        Open Contract (PDF)
                    </a>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Contract'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
