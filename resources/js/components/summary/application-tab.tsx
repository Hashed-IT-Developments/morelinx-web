import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AttachmentFiles from '@/pages/cms/applications/components/attachment-files';
import { Building2, Calendar, FileText, IdCard, MapPin, Phone, User } from 'lucide-react';
import { DataField, InfoCard, OverviewCard, SectionCard } from './shared-components';
import { ApplicationSummary } from './types';
import { formatBillAddress, formatDate } from './utils';

interface ApplicationTabProps {
    application: ApplicationSummary;
    getStatusLabel: (status: string) => string;
    getStatusColor: (status: string) => string;
}

export default function ApplicationTab({ application, getStatusLabel, getStatusColor }: ApplicationTabProps) {
    return (
        <>
            <SectionCard
                title="Application Summary"
                icon={FileText}
                iconColor="text-blue-600"
                gradient="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <OverviewCard
                        label="Account Number"
                        value={
                            <span className="text-blue-600 dark:text-blue-400">
                                {application.account_number || <span className="text-gray-500 italic">Pending Assignment</span>}
                            </span>
                        }
                        mono
                    />
                    <OverviewCard
                        label="Status"
                        value={
                            <Badge variant="outline" className={`${getStatusColor(application.status)} px-3 py-1 text-sm font-medium`}>
                                {getStatusLabel(application.status)}
                            </Badge>
                        }
                    />
                    <OverviewCard
                        label="Customer Type"
                        value={
                            <div>
                                <div>{application.customer_type?.customer_type || 'N/A'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{application.customer_type?.rate_class || 'N/A'}</div>
                                {application.is_isnap && (
                                    <div className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">ISNAP Member</div>
                                )}
                            </div>
                        }
                    />
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <InfoCard icon={User} title="Customer Information" iconColor="text-blue-600">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DataField label="First Name" value={application.first_name} />
                            <DataField label="Middle Name" value={application.middle_name} />
                            <DataField label="Last Name" value={application.last_name} />
                            <DataField label="Suffix" value={application.suffix} />
                            <DataField label="Full Name" value={application.identity} />
                            <DataField label="Email" value={application.email_address} />
                            <DataField label="Birth Date" value={formatDate(application.birth_date)} />
                            <DataField label="Gender" value={application.gender} />
                            <DataField label="Marital Status" value={application.marital_status} />
                            <DataField label="Nationality" value={application.nationality} />
                        </div>
                    </InfoCard>

                    <InfoCard icon={Phone} title="Contact Information" iconColor="text-green-600">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DataField label="Primary Mobile" value={application.mobile_1} />
                            <DataField label="Secondary Mobile" value={application.mobile_2} />
                            <DataField label="Primary Phone" value={application.tel_no_1} />
                            <DataField label="Secondary Phone" value={application.tel_no_2} />
                        </div>
                    </InfoCard>

                    <InfoCard icon={IdCard} title="Identification" iconColor="text-purple-600">
                        <div className="space-y-3">
                            <DataField
                                label="Primary ID"
                                value={`${application.id_type_1 || 'N/A'}${application.id_number_1 ? ` - ${application.id_number_1}` : ''}`}
                            />
                            {application.id_type_2 && (
                                <DataField label="Secondary ID" value={`${application.id_type_2} - ${application.id_number_2 || 'N/A'}`} />
                            )}
                            {application.is_sc && (
                                <div className="space-y-2">
                                    <DataField label="Senior Citizen ID" value={application.sc_number || 'Registered'} />
                                    <DataField label="SC Valid From" value={formatDate(application.sc_from)} />
                                </div>
                            )}
                        </div>
                    </InfoCard>

                    <InfoCard icon={User} title="Contact Person" iconColor="text-teal-600">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DataField label="CP Last Name" value={application.cp_last_name} />
                            <DataField label="CP First Name" value={application.cp_first_name} />
                            <DataField label="CP Middle Name" value={application.cp_middle_name} />
                            <DataField label="Relation" value={application.cp_relation} />
                        </div>
                    </InfoCard>
                </div>

                <div className="space-y-4">
                    <InfoCard icon={MapPin} title="Address Information" iconColor="text-red-600">
                        <div className="space-y-3">
                            <DataField label="Service Address" value={application.full_address} />
                            <DataField label="Billing Address" value={formatBillAddress(application.bill_info)} />

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DataField label="Unit No" value={application.unit_no} />
                                <DataField label="Building" value={application.building} />
                                <DataField label="Street" value={application.street} />
                                <DataField label="Subdivision" value={application.subdivision} />
                                <DataField label="Sitio" value={application.sitio} />
                                <DataField label="Landmark" value={application.landmark} />
                                <DataField label="Block" value={application.block} />
                                <DataField label="Route" value={application.route} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                <DataField label="Barangay" value={application.barangay?.name} />
                                <DataField label="Town/City" value={application.barangay?.town?.name} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <DataField label="District" value={application.district?.name} />
                                <DataField label="Property Ownership" value={application.property_ownership} />
                            </div>

                            {application.sketch_lat_long && <DataField label="GPS Coordinates" value={application.sketch_lat_long} />}
                        </div>
                    </InfoCard>

                    <InfoCard icon={Building2} title="Technical Information" iconColor="text-indigo-600">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DataField label="Connected Load" value={application.connected_load ? `${application.connected_load} kVA` : 'N/A'} />
                            <DataField label="Date Installed" value={formatDate(application.date_installed)} />
                        </div>
                        {application.remarks && (
                            <div className="mt-4">
                                <DataField label="Technical Remarks" value={application.remarks} />
                            </div>
                        )}
                    </InfoCard>

                    {(application.account_name || application.trade_name || application.c_peza_registered_activity) && (
                        <InfoCard icon={Building2} title="Business Information" iconColor="text-orange-600">
                            <div className="space-y-3">
                                {application.account_name && <DataField label="Account Name" value={application.account_name} />}
                                {application.trade_name && <DataField label="Trade Name" value={application.trade_name} />}
                                {application.c_peza_registered_activity && (
                                    <DataField label="PEZA Activity" value={application.c_peza_registered_activity} />
                                )}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {application.cor_number && <DataField label="COR" value={application.cor_number} />}
                                    {application.tin_number && <DataField label="TIN" value={application.tin_number} />}
                                </div>
                                {application.cg_vat_zero_tag && (
                                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300">VAT Zero-Rated</p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    )}

                    <InfoCard icon={Calendar} title="Timeline" iconColor="text-teal-600">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 rounded-md bg-blue-50 p-2.5 dark:bg-blue-900/20">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium">Application Created</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {application.created_at_formatted || formatDate(application.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                                <DataField label="Attachments" value={`${application.attachments_count} files`} />
                                <DataField label="Inspections" value={`${application.inspections_count} records`} />
                            </div>
                        </div>
                    </InfoCard>
                </div>
            </div>

            <Separator />
            <AttachmentFiles attachments={application.attachments} />
        </>
    );
}
