import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, User } from 'lucide-react';
import moment from 'moment';

interface LogsProps {
    logs: Logs[];
}

// Log color configuration - easy to maintain and extend
const LOG_COLOR_CONFIG = {
    creation: {
        keywords: ['creat'],
        circle: 'bg-green-500',
    },
    critical: {
        keywords: ['override', 'delet', 'cancel'],
        circle: 'bg-red-500',
    },
    update: {
        keywords: ['updat', 'chang'],
        circle: 'bg-yellow-500',
    },
    default: {
        circle: 'bg-green-500',
    },
} as const;

const getLogColor = (title: string): string => {
    const lowerTitle = title.toLowerCase();

    // Check each category in priority order
    for (const category of Object.values(LOG_COLOR_CONFIG)) {
        if ('keywords' in category) {
            const hasMatch = category.keywords.some((keyword) => lowerTitle.includes(keyword));
            if (hasMatch) {
                return category.circle;
            }
        }
    }

    return LOG_COLOR_CONFIG.default.circle;
};

const EmptyState = () => (
    <Card>
        <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No logs available yet</p>
            </div>
        </CardContent>
    </Card>
);

const LogDate = ({ date }: { date: string }) => (
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

const LogUser = ({ user }: { user: { name: string } }) => (
    <div className="flex items-center gap-2 border-t pt-3">
        <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-gray-200 text-xs">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>By: {user.name}</span>
        </div>
    </div>
);

const LogItem = ({ log }: { log: Logs }) => {
    const circleColor = getLogColor(log.title);

    return (
        <div className="relative flex gap-3">
            <LogDate date={log.created_at} />
            <TimelineDot color={circleColor} />

            <Card className="flex-1 shadow-sm">
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <Badge className="border-green-200 bg-green-50 text-green-700 capitalize hover:bg-green-100">{log.type}</Badge>
                                <span className="text-xs text-muted-foreground">{moment(log.created_at).format('MMM D, YYYY h:mm A')}</span>
                            </div>
                            <h3 className="text-lg font-semibold">{log.title}</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-gray-700">{log.description}</p>
                    {log.user && <LogUser user={log.user} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default function LogsTimeline({ logs }: LogsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Activity Logs</h2>
            </div>

            {!logs || logs.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="relative">
                    <div className="absolute top-0 bottom-0 left-[4.5rem] w-0.5 bg-gray-200" aria-hidden="true" />

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <LogItem key={log.id} log={log} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
