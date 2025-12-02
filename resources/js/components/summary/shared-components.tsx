import React from 'react';

// --- Reusable Components ---
export const InfoCard = ({
    icon: Icon,
    title,
    children,
    iconColor = 'text-gray-600',
    className = '',
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
    iconColor?: string;
    className?: string;
}) => (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            {title}
        </h3>
        {children}
    </div>
);

export const DataField = ({ label, value, className = '' }: { label: string; value: string | React.ReactNode; className?: string }) => (
    <div className={className}>
        <p className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {value !== null && value !== undefined && value !== '' ? value : 'N/A'}
        </p>
    </div>
);

export const StatusIndicator = ({ status, type = 'inspection' }: { status: string; type?: 'inspection' | 'energization' }) => {
    const configs = {
        inspection: {
            for_inspection: { color: 'bg-blue-500', label: 'Scheduled' },
            completed: { color: 'bg-green-500', label: 'Completed' },
            approved: { color: 'bg-emerald-500', label: 'Approved' },
            rejected: { color: 'bg-red-500', label: 'Rejected' },
            rescheduled: { color: 'bg-yellow-500', label: 'Rescheduled' },
        } as Record<string, { color: string; label: string }>,
        energization: {
            assigned: { color: 'bg-blue-500', label: 'Assigned' },
            in_progress: { color: 'bg-yellow-500', label: 'In Progress' },
            completed: { color: 'bg-green-500', label: 'Completed' },
            declined: { color: 'bg-red-500', label: 'Declined' },
        } as Record<string, { color: string; label: string }>,
    };
    const config = configs[type][status] || { color: 'bg-gray-400', label: status };
    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${config.color}`} />
            <span className="text-sm font-medium">{config.label}</span>
        </div>
    );
};

export const SectionCard = ({
    title,
    icon: Icon,
    iconColor,
    children,
    gradient,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    children: React.ReactNode;
    gradient?: string;
}) => (
    <div className={`${gradient || 'bg-gray-50 dark:bg-gray-800/50'} rounded-lg border border-gray-200/50 p-4 dark:border-gray-700/50`}>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            {title}
        </h2>
        {children}
    </div>
);

export const OverviewCard = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="rounded-lg border border-gray-200/50 bg-white/80 p-3 dark:border-gray-700/50 dark:bg-gray-800/80">
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className={mono ? 'font-mono text-lg font-bold' : 'text-base font-semibold text-gray-900 dark:text-gray-100'}>{value}</div>
    </div>
);

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    tip,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    tip?: string;
}) => (
    <div className="py-16 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200/50 bg-gray-50 p-8 dark:border-gray-700/50 dark:bg-gray-800/50">
            <Icon className="mx-auto mb-6 h-16 w-16 text-gray-400" />
            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
            {tip && (
                <div className="mt-6 rounded-lg border border-blue-200/50 bg-blue-50 p-3 dark:border-blue-800/50 dark:bg-blue-900/20">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{tip}</p>
                </div>
            )}
        </div>
    </div>
);
