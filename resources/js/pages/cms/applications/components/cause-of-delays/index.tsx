import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, User } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import AddCauseOfDelayDialog from './add-cause-of-delay-dialog';

interface CauseOfDelaysProps {
    causeOfDelays: CauseOfDelay[];
    applicationId: string;
}

// Delay source color configuration
const DELAY_SOURCE_CONFIG = {
    customer: {
        label: 'Customer',
        color: 'bg-red-500',
        badgeClass: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    du: {
        label: 'DU',
        color: 'bg-red-500',
        badgeClass: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
    },
    'government agencies': {
        label: 'Government Agencies',
        color: 'bg-red-500',
        badgeClass: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
} as const;

// Process color configuration
const PROCESS_CONFIG = {
    application: {
        label: 'Application',
        badgeClass: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
    },
    inspection: {
        label: 'Inspection',
        badgeClass: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    payment: {
        label: 'Payment',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    installation: {
        label: 'Installation',
        badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    },
    activation: {
        label: 'Activation',
        badgeClass: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    },
} as const;

const getDelaySourceConfig = (source: string) => {
    const key = source.toLowerCase() as keyof typeof DELAY_SOURCE_CONFIG;
    return (
        DELAY_SOURCE_CONFIG[key] || { label: source, color: 'bg-red-500', badgeClass: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100' }
    );
};

const getProcessConfig = (process: string) => {
    const key = process.toLowerCase() as keyof typeof PROCESS_CONFIG;
    return PROCESS_CONFIG[key] || { label: process, badgeClass: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100' };
};

const EmptyState = () => (
    <Card>
        <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No cause of delays recorded yet</p>
            </div>
        </CardContent>
    </Card>
);

const DelayDate = ({ date }: { date: string }) => (
    <div className="w-12 flex-shrink-0 pt-1 text-right text-xs font-bold">
        {moment(date).format('D')}
        <br />
        <span className="text-gray-400">{moment(date).format('MMM YYYY')}</span>
    </div>
);

const TimelineDot = ({ color }: { color: string }) => (
    <div className="relative z-10 flex-shrink-0">
        <div className={cn('flex h-6 w-6 items-center justify-center rounded-full', color)}>
            <div className="h-2 w-2 rounded-full bg-white"></div>
        </div>
    </div>
);

const DelayUser = ({ user }: { user: { name: string } }) => (
    <div className="flex items-center gap-2 border-t pt-3">
        <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-gray-200 text-xs">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Logged by: {user.name}</span>
        </div>
    </div>
);

const DelayItem = ({ delay }: { delay: CauseOfDelay }) => {
    const sourceConfig = getDelaySourceConfig(delay.delay_source);
    const processConfig = getProcessConfig(delay.process);

    return (
        <div className="relative flex gap-3">
            <DelayDate date={delay.created_at} />
            <TimelineDot color={sourceConfig.color} />

            <Card className="flex-1 shadow-sm">
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className={cn('capitalize', sourceConfig.badgeClass)}>{sourceConfig.label}</Badge>
                                <Badge className={cn('capitalize', processConfig.badgeClass)}>{processConfig.label}</Badge>
                                <span className="text-xs text-muted-foreground">{moment(delay.created_at).format('MMM D, YYYY h:mm A')}</span>
                            </div>
                            <h3 className="text-lg font-semibold">
                                {sourceConfig.label} Delay - {processConfig.label} Process
                            </h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {delay.remarks && <p className="mb-4 text-sm text-gray-700">{delay.remarks}</p>}
                    {delay.user && <DelayUser user={delay.user} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default function CauseOfDelaysTimeline({ causeOfDelays, applicationId }: CauseOfDelaysProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cause of Delays / Pendings</h2>
                <Button onClick={() => setIsDialogOpen(true)} size="sm" variant="outline">
                    Log Cause of Delays
                </Button>
            </div>

            {!causeOfDelays || causeOfDelays.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="relative">
                    <div className="absolute top-0 bottom-0 left-[4.5rem] w-0.5 bg-gray-200" aria-hidden="true" />

                    <div className="space-y-4">
                        {causeOfDelays.map((delay) => (
                            <DelayItem key={delay.id} delay={delay} />
                        ))}
                    </div>
                </div>
            )}

            <AddCauseOfDelayDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} applicationId={applicationId} />
        </div>
    );
}
