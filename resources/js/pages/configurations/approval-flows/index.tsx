import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2, Users } from 'lucide-react';
import * as React from 'react';

interface ApprovalStep {
    id: number;
    order: number;
    role_id?: number;
    user_id?: number;
    role?: { id: number; name: string };
    user?: { id: number; name: string };
}

interface ApprovalFlow {
    id: number;
    name: string;
    module: string;
    description?: string;
    department_id?: number;
    created_at: string;
    updated_at: string;
    steps: ApprovalStep[];
}

interface Props {
    approvalFlows: ApprovalFlow[];
}

export default function ApprovalFlowsIndex({ approvalFlows }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [flowToDelete, setFlowToDelete] = React.useState<ApprovalFlow | null>(null);

    const breadcrumbs = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Configurations', href: '#' },
        { title: 'Approval Flows', href: route('approval-flows.index') },
    ];

    const handleEdit = (id: number) => {
        router.visit(route('approval-flows.edit', id));
    };

    const handleDeleteClick = (e: React.MouseEvent, flow: ApprovalFlow) => {
        e.stopPropagation();
        setFlowToDelete(flow);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (flowToDelete) {
            router.delete(route('approval-flows.destroy', flowToDelete.id));
            setDeleteDialogOpen(false);
            setFlowToDelete(null);
        }
    };

    const getModuleLabel = (module: string) => {
        return module
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getStepsPreview = (steps: ApprovalStep[]) => {
        if (steps.length === 0) return 'No steps defined';

        return (
            steps
                .sort((a, b) => a.order - b.order)
                .slice(0, 2) // Show first 2 steps
                .map((step) => {
                    if (step.role) return `Role: ${step.role.name}`;
                    if (step.user) return `User: ${step.user.name}`;
                    return 'Unassigned';
                })
                .join(' → ') + (steps.length > 2 ? ` (+${steps.length - 2} more)` : '')
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Flows" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Approval Flows</h1>
                        <p className="mt-2 text-muted-foreground">Manage your approval workflow configurations.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('approval-flows.create')}>Create Approval Flow</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Approval Flow List</CardTitle>
                        <CardDescription>Configure and manage approval workflows for different modules.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {approvalFlows.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">No approval flows found</h3>
                                <p className="mb-4 text-muted-foreground">Create your first approval workflow to get started.</p>
                                <Button asChild>
                                    <Link href={route('approval-flows.create')}>Create Approval Flow</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Steps</TableHead>
                                            <TableHead>Flow Preview</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-[120px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {approvalFlows.map((flow) => (
                                            <TableRow key={flow.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(flow.id)}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{flow.name}</div>
                                                        {flow.description && (
                                                            <div className="mt-1 text-sm text-muted-foreground">{flow.description}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{getModuleLabel(flow.module)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs text-sm text-muted-foreground">{getStepsPreview(flow.steps)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(flow.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(flow.id);
                                                            }}
                                                            title="Edit approval flow"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleDeleteClick(e, flow)}
                                                            className="text-destructive hover:text-destructive"
                                                            title="Delete approval flow"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the approval flow "{flowToDelete?.name}" and all its steps. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-destructive text-white hover:cursor-pointer hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
