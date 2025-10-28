import { LocationPreview } from '@/components/location-preview';

interface CustomerDetailsProps {
    application: CustomerApplication;
}

export default function CustomerInformation({ application }: CustomerDetailsProps) {
    console.log(application);
    return (
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <p>
                        <strong>Birth Date:</strong> {application.birth_date}
                    </p>
                    <p>
                        <strong>Gender:</strong> {application.gender}
                    </p>
                    <p>
                        <strong>Marital Status:</strong> {application.marital_status}
                    </p>
                    <p>
                        <strong>Nationality:</strong> {application.nationality}
                    </p>
                    <p>
                        <strong>Email:</strong> {application.email_address}
                    </p>
                    <p>
                        <strong>Contact no:</strong> {application.contact_numbers}
                    </p>
                    <p>
                        <strong>Telephone Numbers:</strong> {application.telephone_numbers}
                    </p>

                    {/* Credit Balance */}
                    {application.credit_balance && Number(application.credit_balance.credit_balance || 0) > 0 && (
                        <div className="mt-4 rounded border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/20">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">Credit Balance</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                ₱{Number(application.credit_balance.credit_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Available for payment</p>
                        </div>
                    )}
                </div>
                <div>
                    <p>
                        <strong>District:</strong> {application.district?.name}
                    </p>
                    <p>
                        <strong>Barangay:</strong> {application.barangay?.full_text}
                    </p>
                    <p>
                        <strong>House Number:</strong> {application.house_number}
                    </p>
                    <p>
                        <strong>Building:</strong> {application.building}
                    </p>
                    <p>
                        <strong>Block:</strong> {application.block}
                    </p>
                    <p>
                        <strong>Subdivision:</strong> {application.subdivision}
                    </p>
                    <p>
                        <strong>Street:</strong> {application.street ?? '-'}
                    </p>
                    <p>
                        <strong>Sitio:</strong> {application.sitio ?? '-'}
                    </p>
                    <p>
                        <strong>Route:</strong> {application.route ?? '-'}
                    </p>
                </div>
            </div>

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
