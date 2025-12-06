import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PaginatedTable, { ColumnDefinition } from '@/components/ui/paginated-table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardPen, Eye, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import AmendmentDetailsDialog from './amendment-details-dialog';

interface StatusCard {
    id: number;
    key: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    border: string;
    bg: string;
    iconColor: string;
}

export default function AmendmentIndex({ counts, amendmentRequests }: { counts: Array<number>; amendmentRequests: Array<AmendmentRequest> }) {
    const statusCards = [
        {
            id: 1,
            key: 'pending',
            label: 'Pending Requests',
            icon: ClipboardPen,
            border: 'border-l-gray-400',
            bg: 'bg-gray-50',
            iconColor: 'text-gray-600 dark:text-gray-400',
        },
        {
            id: 2,
            key: 'approved',
            label: 'Approved Requests',
            icon: ThumbsUp,
            border: 'border-l-green-500',
            bg: 'bg-green-50 dark:text-gray-100',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            id: 3,
            key: 'rejected',
            label: 'Rejected Requests',
            icon: ThumbsDown,
            border: 'border-l-red-500',
            bg: 'bg-red-50',
            iconColor: 'text-red-600 dark:text-red-400',
        },
    ] as StatusCard[];

    const statusClass = (status: string) => {
        if (status.toLowerCase() === 'pending') return 'bg-yellow-400';
        else if (status.toLowerCase().startsWith('approved')) return 'bg-green-400 flex flex-col items-center';
        else return 'bg-red-400 flex flex-col items-center';
    };

    const columns: ColumnDefinition[] = [
        {
            key: 'customer_account_id',
            header: 'ID',
            sortable: false,
            className: 'w-16',
            render: (value) => (
                <Link href={'/accounts/' + value} className="font-medium text-blue-500 hover:underline dark:text-blue-300">
                    #{String(value).padStart(8, '0')}
                </Link>
            ),
        },
        {
            key: 'customer_account.account_name',
            header: 'NAME',
            sortable: false,
            render: (value) => <span className="rounded-lg p-2 text-sm font-medium dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'customer_account.customer_type.rate_class',
            header: 'RATE CLASS',
            sortable: false,
            render: (value) => <span className="text-sm font-medium text-gray-600 uppercase dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'customer_account.customer_type.customer_type',
            header: 'CUSTOMER TYPE',
            sortable: false,
            render: (value) => <span className="text-sm font-medium text-gray-600 uppercase dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'fields_count',
            header: 'Amended Fields',
            sortable: false,
            render: (value) => <span className="mx-auto text-sm font-medium text-gray-600 dark:text-blue-400">{String(value)}</span>,
        },
        {
            key: 'status',
            header: 'STATUS',
            sortable: false,
            render: (value: unknown) => (
                <Badge variant="outline" className={statusClass(value as string)}>
                    <div>{String(value)}</div>
                </Badge>
            ),
        },
        {
            key: 'by_user.name',
            header: 'BY USER',
            sortable: false,
            render: (value: unknown) => <div>{value ? String(value) : '-'}</div>,
        },
    ];

    const [showDialog, setShowDialog] = useState(false);
    const [selectedAmendmentRequest, setSelectedAmendmentRequest] = useState<AmendmentRequest>();

    const showAmendmentDetails = (amendment: AmendmentRequest | undefined) => {
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
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{counts[card.id]}</p>
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
                data={amendmentRequests}
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
