import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, FileText, Zap } from 'lucide-react';
import { DataField, EmptyState, InfoCard } from './shared-components';
import { EnergizationDetail } from './types';
import { formatDate } from './utils';

interface EnergizationTabProps {
    energization: EnergizationDetail | null;
    getStatusLabel?: (status: string) => string;
    getStatusColor?: (status: string) => string;
}

export default function EnergizationTab({ energization, getStatusLabel, getStatusColor }: EnergizationTabProps) {
    if (!energization) {
        return (
            <EmptyState
                icon={Zap}
                title="Energization Pending"
                description="Energization will be scheduled after successful completion of the inspection process."
                tip="⚡ Energization typically occurs within 2-3 business days after inspection approval"
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Information */}
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-3 dark:bg-gray-900">
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Energization ID</p>
                    <p className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">#{energization.id}</p>
                </div>
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Status</p>
                    {getStatusLabel && getStatusColor ? (
                        <Badge variant="outline" className={`${getStatusColor(energization.status)} mt-1 text-xs font-medium`}>
                            {getStatusLabel(energization.status)}
                        </Badge>
                    ) : (
                        <p className="text-sm font-medium">{energization.status.replace('_', ' ').toUpperCase()}</p>
                    )}
                </div>
                <div>
                    <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400">Assigned Team</p>
                    <p className="text-sm font-medium">{energization.assigned_team?.name || 'Not Assigned'}</p>
                </div>
            </div>

            {/* Energization Details */}
            <InfoCard icon={Zap} title="Energization Details" iconColor="text-yellow-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DataField label="Service Connection" value={energization.service_connection} />
                    <DataField label="Action Taken" value={energization.action_taken} />
                    <DataField label="Time of Arrival" value={energization.time_of_arrival ? formatDate(energization.time_of_arrival) : null} />
                    <DataField label="Date Installed" value={energization.date_installed ? formatDate(energization.date_installed) : null} />
                    <DataField label="Team Executed" value={energization.team_executed} />
                </div>
            </InfoCard>

            <Separator />

            {/* Transformer Information */}
            <InfoCard icon={Building2} title="Transformer Information" iconColor="text-indigo-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <DataField label="Transformer Owned" value={energization.transformer_owned} />
                    <DataField label="Transformer Rating" value={energization.transformer_rating} />
                </div>

                <div className="mt-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <DataField label="CT Serial Number" value={energization.ct_serial_number} />
                        <DataField label="CT Brand Name" value={energization.ct_brand_name} />
                        <DataField label="CT Ratio" value={energization.ct_ratio} />
                    </div>
                </div>

                <div className="mt-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <DataField label="PT Serial Number" value={energization.pt_serial_number} />
                        <DataField label="PT Brand Name" value={energization.pt_brand_name} />
                        <DataField label="PT Ratio" value={energization.pt_ratio} />
                    </div>
                </div>
            </InfoCard>

            <Separator />

            {/* Remarks */}
            {energization.remarks && (
                <>
                    <InfoCard icon={FileText} title="Remarks" iconColor="text-gray-600">
                        <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{energization.remarks}</p>
                        </div>
                    </InfoCard>

                    <Separator />
                </>
            )}

            {/* Attachments */}
            {energization.attachments && energization.attachments.length > 0 && (
                <>
                    <InfoCard icon={FileText} title="Energization Attachments" iconColor="text-purple-600">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {energization.attachments.map((attachment, index) => (
                                <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{attachment}</span>
                                    </div>
                                    <button className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        View Attachment
                                    </button>
                                </div>
                            ))}
                        </div>
                    </InfoCard>

                    <Separator />
                </>
            )}

            {/* Timestamps */}
            <InfoCard icon={Calendar} title="Timestamps" iconColor="text-teal-600">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DataField label="Created At" value={formatDate(energization.created_at)} />
                    <DataField label="Last Updated" value={formatDate(energization.updated_at)} />
                </div>
            </InfoCard>
        </div>
    );
}
