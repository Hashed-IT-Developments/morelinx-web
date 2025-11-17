import { useTownsAndBarangays } from '@/composables/useTownsAndBarangays';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function StepConfirmation() {
    const form = useFormContext();
    const formValues = form.getValues();

    // Resolve town/barangay names for display (permanent and bill addresses)
    const { towns: addressTowns, barangays: addressBarangays } = useTownsAndBarangays(formValues.district);
    const { towns: billTowns, barangays: billBarangays } = useTownsAndBarangays(formValues.bill_district);

    const addressDistrictName = addressTowns?.find((t) => t.id.toString() === String(formValues.district))?.name;
    const addressBarangayName = addressBarangays?.find((b) => b.id.toString() === String(formValues.barangay))?.name;

    const billDistrictName = billTowns?.find((t) => t.id.toString() === String(formValues.bill_district))?.name;
    const billBarangayName = billBarangays?.find((b) => b.id.toString() === String(formValues.bill_barangay))?.name;

    // State for collapsible sections
    const [openSections, setOpenSections] = useState({
        account: true,
        establishment: true,
        address: true,
        contact: true,
        requirements: true,
        bill: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // Conditional logic for showing sections based on rate_class and customer_type
    const showHouseInfo = ['residential'].includes(formValues.rate_class) || ['temporary_residential'].includes(formValues.customer_type);
    const showEstablishment =
        ['power', 'commercial', 'city_offices', 'other_government'].includes(formValues.rate_class) &&
        formValues.customer_type !== 'temporary_residential';
    const showSeniorCitizenTab = ['residential'].includes(formValues.rate_class);
    const showGovernmentId = !['power'].includes(formValues.rate_class);
    const showChecklistTab = ['temporary_commercial'].includes(formValues.customer_type) || !['power'].includes(formValues.rate_class);

    return (
        <div className="w-full space-y-4">
            <div className="mb-4 text-center">
                <h1 className="text-2xl font-bold">Application Review</h1>
                <p className="text-sm text-gray-600">Please review your information before submitting</p>
            </div>

            {/* Account Information */}
            <div className="rounded-lg border">
                <button
                    type="button"
                    onClick={() => toggleSection('account')}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <h2 className="text-lg font-semibold text-blue-700">Account Information</h2>
                    {openSections.account ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openSections.account && (
                    <div className="border-t px-4 pt-4 pb-4">
                        {/* Type Section */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-base font-medium text-gray-800">Type</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">Rate Class:</span>
                                    <span className="ml-2 rounded-sm bg-blue-100 px-2 py-1 font-semibold text-blue-800">
                                        {formValues.rate_class
                                            ? formValues.rate_class
                                                  .split('_')
                                                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                  .join(' ')
                                            : 'Not specified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Customer Type:</span>
                                    <span className="ml-2 rounded-sm bg-green-100 px-2 py-1 font-semibold text-green-800">
                                        {formValues.customer_type
                                            ? formValues.customer_type
                                                  .split('_')
                                                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                  .join(' ')
                                            : 'Not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ISNAP Membership Section */}
                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">ISNAP Member:</span>
                                    <span className={`ml-2 font-semibold ${formValues.is_isnap ? 'text-green-600' : 'text-gray-600'}`}>
                                        {formValues.is_isnap ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* House Information Section */}
                        {showHouseInfo && (
                            <div className="mb-4">
                                <h3 className="mb-2 text-base font-medium text-gray-800">House Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="font-medium">Connected Load:</span>
                                        <span className="ml-2">{formValues.connected_load || 'Not specified'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Property Ownership:</span>
                                        <span className="ml-2">{formValues.property_ownership || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Personal Information Section */}
                        <div>
                            <h3 className="mb-2 text-base font-medium text-gray-800">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">Last Name:</span>
                                    <span className="ml-2">{formValues.last_name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">First Name:</span>
                                    <span className="ml-2">{formValues.first_name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Middle Name:</span>
                                    <span className="ml-2">{formValues.middle_name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Suffix:</span>
                                    <span className="ml-2">{formValues.suffix || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Birthdate:</span>
                                    <span className="ml-2">
                                        {formValues.birthdate
                                            ? new Date(formValues.birthdate).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : 'Not specified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Nationality:</span>
                                    <span className="ml-2">{formValues.nationality || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Sex:</span>
                                    <span className="ml-2">{formValues.sex || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Marital Status:</span>
                                    <span className="ml-2">{formValues.marital_status || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Establishment Information (for non-residential) */}
            {showEstablishment && (
                <div className="rounded-lg border">
                    <button
                        type="button"
                        onClick={() => toggleSection('establishment')}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                    >
                        <h2 className="text-lg font-semibold text-blue-700">Establishment Information</h2>
                        {openSections.establishment ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                    {openSections.establishment && (
                        <div className="border-t px-4 pt-4 pb-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">Account Name:</span>
                                    <span className="ml-2">{formValues.account_name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Trade Name:</span>
                                    <span className="ml-2">{formValues.trade_name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">PEZA Registered Activity:</span>
                                    <span className="ml-2">{formValues.c_peza_registered_activity || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Address Information */}
            <div className="rounded-lg border">
                <button
                    type="button"
                    onClick={() => toggleSection('address')}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <h2 className="text-lg font-semibold text-blue-700">Address Information</h2>
                    {openSections.address ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openSections.address && (
                    <div className="border-t px-4 pt-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="font-medium">Landmark:</span>
                                <span className="ml-2">{formValues.landmark || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">House/Lot/Unit No.:</span>
                                <span className="ml-2">{formValues.unit_no || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">Building Floor:</span>
                                <span className="ml-2">{formValues.building_floor || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">Street:</span>
                                <span className="ml-2">{formValues.street || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">Subdivision/Condo:</span>
                                <span className="ml-2">{formValues.subdivision || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">District:</span>
                                <span className="ml-2">{addressDistrictName || formValues.district || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="font-medium">Barangay:</span>
                                <span className="ml-2">{addressBarangayName || formValues.barangay || 'Not specified'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="font-medium">Location Coordinates:</span>
                                <span className="ml-2">
                                    {formValues.sketch_lat_long
                                        ? `Latitude: ${formValues.sketch_lat_long.split(',')[0]}, Longitude: ${formValues.sketch_lat_long.split(',')[1]}`
                                        : 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contact Information */}
            <div className="rounded-lg border">
                <button
                    type="button"
                    onClick={() => toggleSection('contact')}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <h2 className="text-lg font-semibold text-blue-700">Contact Information</h2>
                    {openSections.contact ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openSections.contact && (
                    <div className="border-t px-4 pt-4 pb-4">
                        {/* Contact Person Section */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-base font-medium text-gray-800">
                                {['residential'].includes(formValues.rate_class) || formValues.customer_type === 'temporary_residential'
                                    ? 'Contact Person'
                                    : 'Authorized Representative'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">Last Name:</span>
                                    <span className="ml-2">{formValues.cp_lastname || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">First Name:</span>
                                    <span className="ml-2">{formValues.cp_firstname || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Middle Name:</span>
                                    <span className="ml-2">{formValues.cp_middlename || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Suffix:</span>
                                    <span className="ml-2">{formValues.cp_suffix || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Relationship:</span>
                                    <span className="ml-2">{formValues.relationship || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Details Section */}
                        <div>
                            <h3 className="mb-2 text-base font-medium text-gray-800">Contact Details</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">Email Address:</span>
                                    <span className="ml-2">{formValues.cp_email || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Tel No.:</span>
                                    <span className="ml-2">{formValues.cp_tel_no || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Tel No. 2:</span>
                                    <span className="ml-2">{formValues.cp_tel_no_2 || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Mobile No.:</span>
                                    <span className="ml-2">{formValues.cp_mobile_no || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Mobile No. 2:</span>
                                    <span className="ml-2">{formValues.cp_mobile_no_2 || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Requirements */}
            <div className="rounded-lg border">
                <button
                    type="button"
                    onClick={() => toggleSection('requirements')}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <h2 className="text-lg font-semibold text-blue-700">Requirements</h2>
                    {openSections.requirements ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openSections.requirements && (
                    <div className="border-t px-4 pt-4 pb-4">
                        {/* Government ID Section */}
                        {showGovernmentId && (
                            <div className="mb-4">
                                <h3 className="mb-2 text-base font-medium text-gray-800">Government ID</h3>
                                <div className="space-y-3">
                                    {/* Primary ID */}
                                    {formValues.id_category === 'primary' && (
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-gray-700">Primary ID</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium">ID Type:</span>
                                                    <span className="ml-2">{formValues.primary_id_type || 'Not specified'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">ID Number:</span>
                                                    <span className="ml-2">{formValues.primary_id_number || 'Not specified'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Secondary IDs */}
                                    {formValues.id_category === 'secondary' && (
                                        <>
                                            {/* Secondary ID 1 */}
                                            {(formValues.secondary_id_1_type || formValues.secondary_id_1_number) && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-gray-700">Secondary ID 1</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="font-medium">ID Type:</span>
                                                            <span className="ml-2">{formValues.secondary_id_1_type || 'Not specified'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">ID Number:</span>
                                                            <span className="ml-2">{formValues.secondary_id_1_number || 'Not specified'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Secondary ID 2 */}
                                            {(formValues.secondary_id_2_type || formValues.secondary_id_2_number) && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium text-gray-700">Secondary ID 2</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <span className="font-medium">ID Type:</span>
                                                            <span className="ml-2">{formValues.secondary_id_2_type || 'Not specified'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">ID Number:</span>
                                                            <span className="ml-2">{formValues.secondary_id_2_number || 'Not specified'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Government Info Section */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-base font-medium text-gray-800">Government Information</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">COR Number:</span>
                                    <span className="ml-2">{formValues.cor_number || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">TIN Number:</span>
                                    <span className="ml-2">{formValues.tin_number || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Issued Date:</span>
                                    <span className="ml-2">
                                        {formValues.issued_date ? new Date(formValues.issued_date).toLocaleDateString() : 'Not specified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">VAT Zero Tag:</span>
                                    <span className="ml-2">{formValues.cg_vat_zero_tag ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Senior Citizen Section */}
                        {showSeniorCitizenTab && (
                            <div className="mb-4">
                                <h3 className="mb-2 text-base font-medium text-gray-800">Senior Citizen</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="font-medium">Is Senior Citizen:</span>
                                        <span className="ml-2">{formValues.is_senior_citizen ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">SC Date From:</span>
                                        <span className="ml-2">
                                            {formValues.sc_from ? new Date(formValues.sc_from).toLocaleDateString() : 'Not specified'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">OSCA ID No.:</span>
                                        <span className="ml-2">{formValues.sc_number || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Document Attachments Section */}
                        {showChecklistTab && (
                            <div>
                                <h3 className="mb-2 text-base font-medium text-gray-800">Document Attachments</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {formValues.attachments &&
                                        Object.entries(formValues.attachments).map(([key, value]) => {
                                            if (key === 'file') return null; // Handle file separately
                                            const labelMap: { [key: string]: string } = {
                                                passport: 'Passport',
                                                national_id: 'Philippine National ID (PhilSys)',
                                                driver_license: "Driver's License",
                                                sss_id: 'SSS ID',
                                                umid: 'UMID',
                                                philhealth_id: 'PhilHealth ID',
                                                tin_id: 'TIN ID',
                                                voter_id: "Voter's ID",
                                                prc_id: 'PRC ID',
                                                pagibig_id: 'PAG-IBIG ID',
                                                postal_id: 'Postal ID',
                                                senior_citizen_id: 'Senior Citizen ID',
                                                ofw_id: 'OFW ID',
                                                student_id: 'Student ID',
                                                pwd_id: 'PWD ID',
                                                gsis_id: 'GSIS ID',
                                                firearms_license: 'Firearms License',
                                                marina_id: 'MARINA ID',
                                                philippine_passport_card: 'Philippine Passport Card',
                                                company_id: 'Company ID',
                                            };

                                            return (
                                                <div key={key} className="flex items-center">
                                                    <span
                                                        className={`mr-2 inline-block h-3 w-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                                                    ></span>
                                                    <span className={value ? 'text-green-700' : 'text-gray-500'}>{labelMap[key] || key}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                                {formValues.attachments?.file && (
                                    <div className="mt-3">
                                        <span className="font-medium">Attached File:</span>
                                        <span className="ml-2">{formValues.attachments.file.name || 'File attached'}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bill Information */}
            <div className="rounded-lg border">
                <button
                    type="button"
                    onClick={() => toggleSection('bill')}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <h2 className="text-lg font-semibold text-blue-700">Bill Information</h2>
                    {openSections.bill ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>
                {openSections.bill && (
                    <div className="border-t px-4 pt-4 pb-4">
                        {/* Bill Address Section */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-base font-medium text-gray-800">Bill Address</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="font-medium">District:</span>
                                    <span className="ml-2">{billDistrictName || formValues.bill_district || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Barangay:</span>
                                    <span className="ml-2">{billBarangayName || formValues.bill_barangay || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Landmark:</span>
                                    <span className="ml-2">{formValues.bill_landmark || formValues.landmark || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Subdivision/Condo:</span>
                                    <span className="ml-2">{formValues.bill_subdivision || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Street:</span>
                                    <span className="ml-2">{formValues.bill_street || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Building Floor:</span>
                                    <span className="ml-2">{formValues.bill_building_floor || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">House/Lot/Unit No.:</span>
                                    <span className="ml-2">{formValues.bill_house_no || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bill Delivery Section */}
                        <div>
                            <h3 className="mb-2 text-base font-medium text-gray-800">Bill Delivery Options</h3>
                            <div>
                                <span className="font-medium">Selected Delivery Methods:</span>
                                <span className="ml-2">
                                    {formValues.bill_delivery && Array.isArray(formValues.bill_delivery) && formValues.bill_delivery.length > 0
                                        ? formValues.bill_delivery
                                              .map((method: string) =>
                                                  method
                                                      .split('_')
                                                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                                      .join(' '),
                                              )
                                              .join(', ')
                                        : 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Note */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-center text-blue-800">
                    <strong>Note:</strong> Please review all information carefully. Click "Submit" to submit your application or "Back" to make any
                    changes.
                </p>
            </div>
        </div>
    );
}
