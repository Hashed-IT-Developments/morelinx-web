import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PaginatedTable, { ColumnDefinition } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardPen, Eye, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import AmendmentDetailsDialog from './amendment-details-dialog';

export default function AmendmentIndex({ counts, amendmentRequests }: { counts: Array<number>; amendmentRequests: Array<AmendmentRequest> }) {
    const statusCards = [
        {
            key: 'pending',
            label: 'Pending Requests',
            icon: ClipboardPen,
            border: 'border-l-gray-400',
            bg: 'bg-gray-50',
            iconColor: 'text-gray-600 dark:text-gray-400',
        },
        {
            key: 'approved',
            label: 'Approved Requests',
            icon: ThumbsUp,
            border: 'border-l-green-500',
            bg: 'bg-green-50 dark:text-gray-100',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            key: 'rejected',
            label: 'Rejected Requests',
            icon: ThumbsDown,
            border: 'border-l-red-500',
            bg: 'bg-red-50',
            iconColor: 'text-red-600 dark:text-red-400',
        },
    ];

    const statusClass = (status: string) => {
        if (status.toLowerCase() === 'pending') return 'bg-yellow-400';
        else if (status.toLowerCase().startsWith('approved')) return 'bg-green-400';
        else return 'bg-red-400';
    };

    const columns: ColumnDefinition[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            className: 'w-16',
            render: (value) => <Link href={'/applications/' + value} className="font-medium text-blue-500 dark:text-blue-300 hover:underline">#{String(value).padStart(8,'0')}</Link>,
        },
        {
            key: 'customer_application.identity',
            header: 'IDENTITY',
            sortable: true,
            render: (value) => <span className="rounded-lg p-2 text-sm font-medium dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'customer_application.customer_type.rate_class',
            header: 'RATE CLASS',
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-gray-600 uppercase dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'customer_application.customer_type.customer_type',
            header: 'CUSTOMER TYPE',
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-gray-600 uppercase dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'fields_count',
            header: 'Amended Fields',
            sortable: true,
            render: (value) => <span className="text-sm font-medium text-gray-600 dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'status',
            header: 'STATUS',
            sortable: true,
            render: (value: unknown) => (
                <Badge variant="outline" className={statusClass(value as string)}>
                    {String(value)}
                </Badge>
            ),
        },
    ];

    const [showDialog, setShowDialog] = useState(false);
    const [selectedAmendmentRequest, setSelectedAmendmentRequest] = useState<AmendmentRequest>();

    const showAmendmentDetails = (amendment: AmendmentRequest | undefined) => {
        console.log(amendment);
        setShowDialog(true);
        setSelectedAmendmentRequest(amendment);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Amendments', href: route('amendment-requests.index') },
            ]}
        >
            <Head title={'Inspections'} />

            <div className="space-y-6 p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statusCards.map((card, idx) => (
                        <Card key={idx} className={card.border}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts[card.key]}</p>
                                    </div>
                                    <div className={`rounded-lg ${card.bg} p-2 dark:bg-blue-900/20`}>
                                        <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <PaginatedTable
                data={
                    amendmentRequests as unknown as {
                        id: number;
                        identity: string;
                        status: string;
                    }
                }
                title="Amendment Requests"
                columns={columns}
                actions={(row) => {
                    const amendment = row as unknown as AmendmentRequest;
                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                                showAmendmentDetails(amendment);
                            }}
                        >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">Show Details</span>
                        </Button>
                    );
                }}
                emptyMessage="No amendments found"
            />

            <AmendmentDetailsDialog open={showDialog} onOpenChange={setShowDialog} amendmentRequest={selectedAmendmentRequest} />
        </AppLayout>
    );
}
