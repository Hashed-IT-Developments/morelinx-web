import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, MapPin, Phone, User, Zap } from 'lucide-react';
import { DataField, InfoCard, OverviewCard, SectionCard } from './shared-components';
import { formatDate } from './utils';

interface AccountTabProps {
    account: Account;
    getStatusLabel: (status: string) => string;
    getStatusColor: (status: string) => string;
}

export default function AccountTab({ account, getStatusLabel, getStatusColor }: AccountTabProps) {
    return (
        <>
            <SectionCard
                title="Account Summary"
                icon={Zap}
                iconColor="text-emerald-600"
                gradient="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <OverviewCard
                        label="Account Number"
                        value={<span className="text-emerald-600 dark:text-emerald-400">{account.account_number || 'N/A'}</span>}
                        mono
                    />
                    <OverviewCard
                        label="Status"
                        value={
                            <Badge variant="outline" className={`${getStatusColor(account.account_status)} px-3 py-1 text-sm font-medium`}>
                                {getStatusLabel(account.account_status)}
                            </Badge>
                        }
                    />
                    <OverviewCard
                        label="Customer Type"
                        value={
                            <div>
                                <div>{account.customer_type?.customer_type || 'N/A'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{account.customer_type?.rate_class || 'N/A'}</div>
                            </div>
                        }
                    />
                </div>
            </SectionCard>

            {/* Customer Information */}
            <InfoCard icon={User} title="Customer Information" iconColor="text-purple-600">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <DataField label="Full Name" value={account.customer_application?.identity} />
                    <DataField label="Account Name" value={account.account_name} />
                    <DataField
                        label="Birth Date"
                        value={account.customer_application?.birth_date ? formatDate(account.customer_application.birth_date) : null}
                    />
                    <DataField label="Gender" value={account.customer_application?.gender} />
                    <DataField label="Marital Status" value={account.customer_application?.marital_status} />
                    <DataField label="Nationality" value={account.customer_application?.nationality} />
                </div>
            </InfoCard>

            {/* Contact Information */}
            <InfoCard icon={Phone} title="Contact Information" iconColor="text-blue-600">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <DataField label="Email Address" value={account.customer_application?.email_address || account.email_address} />
                    <DataField label="Contact Number" value={account.customer_application?.mobile_1 || account.contact_number} />
                    <DataField label="Primary Mobile" value={account.customer_application?.mobile_1} />
                    <DataField label="Secondary Mobile" value={account.customer_application?.mobile_2} />
                    <DataField label="Primary Telephone" value={account.customer_application?.tel_no_1} />
                    <DataField label="Secondary Telephone" value={account.customer_application?.tel_no_2} />
                </div>
            </InfoCard>

            {/* Address Information */}
            <InfoCard icon={MapPin} title="Address Information" iconColor="text-green-600">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <DataField label="Service Address" value={account.customer_application?.full_address} className="sm:col-span-2" />
                    <DataField label="House Number" value={account.house_number} />
                    <DataField label="Meter Location" value={account.meter_loc} />
                    <DataField label="Barangay" value={account.barangay?.name} />
                    <DataField label="Town/City" value={account.barangay?.town?.name} />
                    <DataField label="District" value={account.district?.name} />
                </div>
            </InfoCard>

            {/* Technical Information */}
            <InfoCard icon={Building2} title="Technical Information" iconColor="text-orange-600">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <DataField label="Pole Number" value={account.pole_number} />
                    <DataField label="Feeder" value={account.feeder} />
                    <DataField label="Multiplier" value={account.multiplier} />
                    <DataField label="Connected Load" value={account.connected_load ? `${account.connected_load} kW` : null} />
                    <DataField label="Connection Date" value={account.connection_date ? formatDate(account.connection_date) : null} />
                    <DataField label="Latest Reading Date" value={account.latest_reading_date ? formatDate(account.latest_reading_date) : null} />
                    <DataField label="Contestable" value={account.contestable !== null ? (account.contestable ? 'Yes' : 'No') : null} />
                    <DataField label="Net Metered" value={account.net_metered !== null ? (account.net_metered ? 'Yes' : 'No') : null} />
                </div>
            </InfoCard>

            {/* Special Programs */}
            <InfoCard icon={Calendar} title="Special Programs" iconColor="text-pink-600">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                    <div>
                        <DataField label="Senior Citizen" value={account.is_sc ? 'Yes' : 'No'} />
                        {account.is_sc && (
                            <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Applied: {formatDate(account.sc_date_applied)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {formatDate(account.sc_date_expired)}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <DataField label="ISNAP Member" value={account.is_isnap ? 'Yes' : 'No'} />
                    </div>
                    <div>
                        <DataField label="Lifeline" value={account.life_liner ? 'Yes' : 'No'} />
                        {account.life_liner && (
                            <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Applied: {formatDate(account.life_liner_date_applied)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {formatDate(account.life_liner_date_expire)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </InfoCard>

            {/* Meters Section */}
            {account.meters && account.meters.length > 0 && (
                <InfoCard icon={Zap} title={`Meter Information (${account.meters.length})`} iconColor="text-yellow-600">
                    <div className="space-y-4">
                        {account.meters.map((meter, index) => (
                            <div key={meter.id}>
                                {index > 0 && <Separator className="my-4" />}
                                <h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Meter {index + 1}</h4>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                                    <DataField label="Serial Number" value={meter.meter_serial_number} />
                                    <DataField label="Brand" value={meter.meter_brand} />
                                    <DataField label="Type" value={meter.type} />
                                    <DataField label="Seal Number" value={meter.seal_number} />
                                    <DataField label="ERC Seal" value={meter.erc_seal} />
                                    <DataField label="MORE Seal" value={meter.more_seal} />
                                    <DataField label="Voltage" value={meter.voltage ? `${meter.voltage}V` : null} />
                                    <DataField label="Multiplier" value={meter.multiplier ? `${meter.multiplier}` : null} />
                                    <DataField label="Initial Reading" value={meter.initial_reading ? `${meter.initial_reading}` : null} />
                                </div>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {/* Notes */}
            {account.notes && (
                <InfoCard icon={Calendar} title="Notes" iconColor="text-gray-600">
                    <p className="text-gray-700 dark:text-gray-300">{account.notes}</p>
                </InfoCard>
            )}
        </>
    );
}
