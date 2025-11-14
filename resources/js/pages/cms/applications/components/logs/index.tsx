import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, User } from 'lucide-react';
import moment from 'moment';

interface LogsProps {
    logs: Logs[];
}

interface LogColors {
    circle: string;
    badge: string;
}

// Log color configuration - easy to maintain and extend
const LOG_COLOR_CONFIG = {
    creation: {
        keywords: ['creat'],
        colors: {
            circle: 'bg-green-500',
            badge: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        },
    },
    critical: {
        keywords: ['override', 'delet', 'cancel'],
        colors: {
            circle: 'bg-red-500',
            badge: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        },
    },
    update: {
        keywords: ['updat', 'chang'],
        colors: {
            circle: 'bg-yellow-500',
            badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
        },
    },
    default: {
        circle: 'bg-green-500',
        badge: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    },
} as const;

const getLogColor = (title: string): LogColors => {
    const lowerTitle = title.toLowerCase();

    // Check each category in priority order
    for (const category of Object.values(LOG_COLOR_CONFIG)) {
        if ('keywords' in category) {
            const hasMatch = category.keywords.some((keyword) => lowerTitle.includes(keyword));
            if (hasMatch) {
                return category.colors;
            }
        }
    }

    return LOG_COLOR_CONFIG.default;
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
        <div className={`h-6 w-6 rounded-full ${color} flex items-center justify-center`}>
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
    const colors = getLogColor(log.title);

    return (
        <div className="relative flex gap-3">
            <LogDate date={log.created_at} />
            <TimelineDot color={colors.circle} />

            <Card className="flex-1 shadow-sm">
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <Badge className={colors.badge}>{log.type}</Badge>
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
    if (!logs || logs.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-4">
            <h2 className="mt-4 text-xl font-semibold">Activity Logs</h2>

            <div className="relative">
                <div className="absolute top-0 bottom-0 left-18 w-0.5 bg-gray-200" aria-hidden="true" />

                <div className="space-y-4">
                    {logs.map((log) => (
                        <LogItem key={log.id} log={log} />
                    ))}
                </div>
            </div>
        </div>
    );
}
