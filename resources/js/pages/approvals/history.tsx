import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface ApprovalHistory {
    id: number;
    status: string;
    remarks: string;
    approved_at: string;
    approver: string;
    step_info: {
        order: number;
        assigned_to: string;
        assignment_type: 'user' | 'role';
    };
}

interface Model {
    type: string;
    id: number;
    title: string;
}

interface Props {
    history: ApprovalHistory[];
    model: Model;
    current_status: string;
    progress: {
        current_step: number;
        total_steps: number;
        percentage: number;
    };
    source?: string;
}

export default function ApprovalHistory({ history, model, current_status, progress, source }: Props) {
    const backUrl =
        source === 'applications.approvals'
            ? '/customer-applications/approvals'
            : source === 'inspections.approvals'
              ? '/inspections/approvals'
              : '/customer-applications/approvals';

    const breadcrumbs = [
        { title: 'Approvals', href: backUrl },
        { title: 'History', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Approval History - ${model.title}`} />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={backUrl} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Approvals
                    </Link>
                </div>

                {/* Model Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Approval History</span>
                            <Badge variant="outline">{model.type}</Badge>
                        </CardTitle>
                        <CardDescription>{model.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Current Status:</span>
                            <Badge
                                className={cn(
                                    current_status.toLowerCase().includes('approved')
                                        ? 'bg-green-100 text-green-800'
                                        : current_status.toLowerCase().includes('rejected')
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800',
                                )}
                            >
                                {current_status}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Progress:</span>
                                <span className="text-muted-foreground">
                                    Step {progress.current_step} of {progress.total_steps}
                                </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* History Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Timeline</CardTitle>
                        <CardDescription>Complete history of approval actions for this item</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No approval history available yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((record, index) => (
                                    <div key={record.id} className="relative">
                                        {/* Timeline line */}
                                        {index < history.length - 1 && <div className="absolute top-12 left-6 h-16 w-0.5 bg-gray-200" />}

                                        <div className="flex gap-4">
                                            {/* Status indicator */}
                                            <div
                                                className={cn(
                                                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm',
                                                    record.status === 'approved'
                                                        ? 'bg-green-500'
                                                        : record.status === 'rejected'
                                                          ? 'bg-red-500'
                                                          : 'bg-blue-500',
                                                )}
                                            >
                                                <span className="text-xs font-bold text-white">{record.step_info.order}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <Card className="shadow-sm">
                                                    <CardContent className="p-4">
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    Step {record.step_info.order}: {record.step_info.assigned_to}
                                                                </h4>
                                                                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="h-3 w-3" />
                                                                        {record.approver}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {new Date(record.approved_at).toLocaleString()}
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {record.step_info.assignment_type}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                className={cn(
                                                                    record.status === 'approved'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800',
                                                                )}
                                                            >
                                                                {record.status}
                                                            </Badge>
                                                        </div>

                                                        {record.remarks && (
                                                            <div className="mt-3 rounded-md bg-gray-50 p-3">
                                                                <p className="text-sm text-gray-700">
                                                                    <span className="font-medium">Remarks:</span> {record.remarks}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
