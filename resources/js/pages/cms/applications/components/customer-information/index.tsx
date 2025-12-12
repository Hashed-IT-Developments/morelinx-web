import { LocationPreview } from '@/components/location-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerDetailsProps {
    application: CustomerApplication;
}

export default function CustomerInformation({ application }: CustomerDetailsProps) {
    const isContactPerson =
        application.customer_type?.rate_class === 'residential' ||
        (application.customer_type?.rate_class === 'power' && application.customer_type?.customer_type === 'temporary_residential');
    const representativeLabel = isContactPerson ? 'Contact Person' : 'Authorized Representative';
    const relationshipLabel = isContactPerson ? 'Contact Person Relationship' : 'Representative Relationship';
    return (
        <div className="mt-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                        {(application.customer_type?.rate_class === 'residential' ||
                            application.customer_type?.customer_type === 'temporary_residential') && (
                            <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400">Birth Date</span>
                                <span className="font-medium">{application.birth_date}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Gender</span>
                            <span className="font-medium">{application.gender}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Marital Status</span>
                            <span className="font-medium">{application.marital_status}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Nationality</span>
                            <span className="font-medium">{application.nationality}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">{representativeLabel}</span>
                            <span className="text-right font-medium">
                                {(
                                    (application.cp_first_name || '') +
                                    ' ' +
                                    (application.cp_middle_name || '') +
                                    ' ' +
                                    (application.cp_last_name || '')
                                ).trim() || '-'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">{relationshipLabel}</span>
                            <span className="text-right font-medium">{application.cp_relation}</span>
                        </div>

                        {(application.mobile_1 || application.mobile_2) && (
                            <>
                                {application.mobile_1 && (
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Mobile 1</span>
                                        <span className="font-medium">{application.mobile_1}</span>
                                    </div>
                                )}
                                {application.mobile_2 && (
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Mobile 2</span>
                                        <span className="font-medium">{application.mobile_2}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {(application.tel_no_1 || application.tel_no_2) && (
                            <>
                                {application.tel_no_1 && (
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Telephone 1</span>
                                        <span className="font-medium">{application.tel_no_1}</span>
                                    </div>
                                )}
                                {application.tel_no_2 && (
                                    <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                                        <span className="text-gray-500 dark:text-gray-400">Telephone 2</span>
                                        <span className="font-medium">{application.tel_no_2}</span>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium">{application.email_address}</span>
                        </div>

                        {application.credit_balance && Number(application.credit_balance.credit_balance || 0) > 0 && (
                            <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/20">
                                <p className="text-xs font-medium tracking-wider text-blue-600 uppercase dark:text-blue-400">Credit Balance</p>
                                <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    ₱{Number(application.credit_balance.credit_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">Available for payment</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">District</span>
                            <span className="text-right font-medium">{application.barangay?.town_name || application.district?.name || '-'}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Barangay</span>
                            <span className="text-right font-medium">{application.barangay?.name}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">House/Unit Number</span>
                            <span className="text-right font-medium">{application.unit_no}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Building Floor</span>
                            <span className="text-right font-medium">{application.building ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Subdivision</span>
                            <span className="text-right font-medium">{application.subdivision}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Street</span>
                            <span className="text-right font-medium">{application.street ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Landmark</span>
                            <span className="text-right font-medium">{application.landmark ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Sitio</span>
                            <span className="text-right font-medium">{application.sitio ?? '-'}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-1 dark:border-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Route</span>
                            <span className="text-right font-medium">{application.route ?? '-'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Location Map Preview */}
            {application.sketch_lat_long && (
                <div className="mt-6">
                    <h3 className="mb-2 text-lg font-semibold">Location on Map</h3>
                    <LocationPreview coordinates={application.sketch_lat_long} height="400px" />
                    <p className="mt-2 text-sm text-gray-600">
                        <strong>Coordinates:</strong> {application.sketch_lat_long}
                    </p>
                </div>
            )}
        </div>
    );
}
