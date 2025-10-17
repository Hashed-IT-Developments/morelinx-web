interface CustomerDetailsProps {
    application: CustomerApplication;
}

export default function CustomerInformation({ application }: CustomerDetailsProps) {
    console.log(application);
    return (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
    );
}
