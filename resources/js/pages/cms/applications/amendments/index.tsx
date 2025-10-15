import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ClipboardPen, ThumbsDown, ThumbsUp } from 'lucide-react';

export default function AmendmentIndex({ counts }: { count: Array<number> }) {
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
            bg: 'bg-green-50',
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
        </AppLayout>
    );
}
