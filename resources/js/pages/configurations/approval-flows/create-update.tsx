import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Zod Schema for form validation
const approvalStepSchema = z
    .object({
        order: z.number().min(1),
        role_id: z.number().optional().nullable(),
        user_id: z.number().optional().nullable(),
    })
    .refine((data) => data.role_id || data.user_id, {
        message: 'Each step must have either a role or user assigned',
        path: ['role_id'], // This will show the error on role_id field
    });

const approvalFlowSchema = z.object({
    name: z.string().min(1, 'Flow name is required').max(255, 'Flow name is too long'),
    module: z.string().min(1, 'Please select a module'),
    description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
    department_id: z.number().optional(),
    steps: z.array(approvalStepSchema).min(1, 'At least one approval step is required'),
});

type ApprovalFlowForm = z.infer<typeof approvalFlowSchema>;

interface Module {
    value: string;
    label: string;
}

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface ApprovalFlowData {
    id: number;
    name: string;
    module: string;
    description?: string;
    department_id?: number;
    steps: {
        id: number;
        order: number;
        role_id?: number;
        user_id?: number;
        role?: { id: number; name: string };
        user?: { id: number; name: string };
    }[];
}

interface Props {
    modules: Module[];
    roles: Role[];
    users: User[];
    approvalFlow?: ApprovalFlowData;
}

export default function CreateUpdateApprovalFlow({ modules, roles, users, approvalFlow }: Props) {
    const isEditing = !!approvalFlow;
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<ApprovalFlowForm>({
        resolver: zodResolver(approvalFlowSchema),
        defaultValues: {
            name: approvalFlow?.name || '',
            module: approvalFlow?.module || '',
            description: approvalFlow?.description || '',
            steps: approvalFlow?.steps?.map((step) => ({
                order: step.order,
                role_id: step.role_id || undefined,
                user_id: step.user_id || undefined,
            })) || [{ order: 1 }],
        },
    });

    const watchedSteps = form.watch('steps');

    const addStep = () => {
        const newOrder = watchedSteps.length + 1;
        form.setValue('steps', [...watchedSteps, { order: newOrder }]);
    };

    const removeStep = (index: number) => {
        if (watchedSteps.length > 1) {
            const newSteps = watchedSteps.filter((_, i) => i !== index);
            // Re-order the remaining steps
            const reorderedSteps = newSteps.map((step, i) => ({
                ...step,
                order: i + 1,
            }));
            form.setValue('steps', reorderedSteps);
        }
    };

    const updateStepRole = (stepIndex: number, roleId: string) => {
        const updatedSteps = [...watchedSteps];
        updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            role_id: roleId === 'clear' ? undefined : parseInt(roleId),
            user_id: undefined, // Clear user when role is selected
        };
        form.setValue('steps', updatedSteps);
    };

    const updateStepUser = (stepIndex: number, userId: string) => {
        const updatedSteps = [...watchedSteps];
        updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            user_id: userId === 'clear' ? undefined : parseInt(userId),
            role_id: undefined, // Clear role when user is selected
        };
        form.setValue('steps', updatedSteps);
    };

    const onSubmit = async (data: ApprovalFlowForm) => {
        setIsSubmitting(true);

        // Validate that all steps have either role_id or user_id
        const validSteps = data.steps.filter((step) => step.role_id || step.user_id);

        if (validSteps.length === 0) {
            alert('Please assign at least one step to a role or user');
            setIsSubmitting(false);
            return;
        }

        if (!data.module) {
            alert('Please select a module');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...data,
            steps: validSteps,
        };

        if (isEditing && approvalFlow) {
            router.put(route('approval-flows.update', approvalFlow.id), payload, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    router.visit(route('approval-flows.index'));
                },
                onError: () => {
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post(route('approval-flows.store'), payload, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    router.visit(route('approval-flows.index'));
                },
                onError: () => {
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Configurations', href: '#' },
        { title: 'Approval Flows', href: route('approval-flows.index') },
        { title: isEditing ? 'Edit Approval Flow' : 'Create Approval Flow', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Approval Flow' : 'Create Approval Flow'} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">{isEditing ? 'Edit Approval Flow' : 'Create Approval Flow'}</h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing ? 'Update the approval workflow configuration.' : 'Configure a new approval workflow for a specific module.'}
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the basic details for this approval flow.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required>Flow Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter approval flow name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="module"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required>Module</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a module" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {modules.map((module) => (
                                                            <SelectItem key={module.value} value={module.value}>
                                                                {module.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter a description for this approval flow" {...field} />
                                            </FormControl>
                                            <FormDescription>Optional description to help identify this approval flow.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Approval Steps */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Approval Steps</CardTitle>
                                        <CardDescription>
                                            Define the sequence of approvals required. Each step must have either a role or a specific user assigned.
                                        </CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addStep} className="shrink-0">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Step
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {watchedSteps.map((step, index) => (
                                        <div key={index} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Step {step.order}</h4>
                                                {watchedSteps.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeStep(index)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Assign to Role</Label>
                                                    <Select
                                                        value={step.role_id?.toString() || undefined}
                                                        onValueChange={(value) => updateStepRole(index, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {step.role_id && (
                                                                <SelectItem value="clear" className="text-muted-foreground">
                                                                    ✕ Clear role selection
                                                                </SelectItem>
                                                            )}
                                                            {roles.map((role) => (
                                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                                    {role.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-muted-foreground">Assign this step to any user with this role</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Or Assign to Specific User</Label>
                                                    <Select
                                                        value={step.user_id?.toString() || undefined}
                                                        onValueChange={(value) => updateStepUser(index, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a user" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {step.user_id && (
                                                                <SelectItem value="clear" className="text-muted-foreground">
                                                                    ✕ Clear user selection
                                                                </SelectItem>
                                                            )}
                                                            {users.map((user) => (
                                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                                    {user.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-muted-foreground">Assign this step to a specific user</p>
                                                </div>
                                            </div>

                                            {!step.role_id && !step.user_id && (
                                                <div className="pl-4">
                                                    <p className="rounded-md border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                                                        ⚠️ This step needs either a role or user assignment to be valid.
                                                    </p>
                                                </div>
                                            )}

                                            {index < watchedSteps.length - 1 && <Separator className="my-4" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                                <CardDescription>Review the approval flow before creating.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p>
                                        <strong>Flow Name:</strong> {form.watch('name') || 'Not specified'}
                                    </p>
                                    <p>
                                        <strong>Module:</strong>{' '}
                                        {form.watch('module') ? modules.find((m) => m.value === form.watch('module'))?.label : 'Not selected'}
                                    </p>
                                    {form.watch('description') && (
                                        <p>
                                            <strong>Description:</strong> {form.watch('description')}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Valid Steps:</strong> {watchedSteps.filter((step) => step.role_id || step.user_id).length} of{' '}
                                        {watchedSteps.length}
                                    </p>

                                    {watchedSteps.filter((step) => step.role_id || step.user_id).length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="mb-2 font-medium">Approval Sequence:</h4>
                                            <ol className="list-inside list-decimal space-y-1 text-sm">
                                                {watchedSteps
                                                    .filter((step) => step.role_id || step.user_id)
                                                    .map((step, index) => {
                                                        const role = roles.find((r) => r.id === step.role_id);
                                                        const user = users.find((u) => u.id === step.user_id);
                                                        return (
                                                            <li key={index}>
                                                                {role ? `Role: ${role.name}` : user ? `User: ${user.name}` : 'Unassigned'}
                                                            </li>
                                                        );
                                                    })}
                                            </ol>
                                        </div>
                                    )}

                                    {/* Form Validation Status */}
                                    <div className="mt-4 rounded-md border p-3">
                                        {form.watch('name') &&
                                        form.watch('module') &&
                                        watchedSteps.filter((step) => step.role_id || step.user_id).length > 0 ? (
                                            <p className="text-sm font-medium text-green-600">✅ Form is ready to submit</p>
                                        ) : (
                                            <div className="text-sm text-amber-600">
                                                <p className="font-medium">⚠️ Please complete the following:</p>
                                                <ul className="mt-1 list-inside list-disc space-y-1">
                                                    {!form.watch('name') && <li>Enter a flow name</li>}
                                                    {!form.watch('module') && <li>Select a module</li>}
                                                    {watchedSteps.filter((step) => step.role_id || step.user_id).length === 0 && (
                                                        <li>Assign at least one approval step to a role or user</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.visit(route('approval-flows.index'))}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? isEditing
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : isEditing
                                      ? 'Update Approval Flow'
                                      : 'Create Approval Flow'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
