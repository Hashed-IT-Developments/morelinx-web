import Button from '@/components/composables/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { CustomerApplication } from '@/types';
import { Pencil } from 'lucide-react';

interface ApplicationViewProps {
    application: CustomerApplication;
}
export default function ApplicationView({ application }: ApplicationViewProps) {
    const breadcrumbs = [
        { title: 'Applications', href: '/applications/all' },
        { title: 'View Application', href: '/applications/view' },
    ];
    return (
        <main>
            <AppLayout breadcrumbs={breadcrumbs}>
                <header className="flex items-center justify-between p-2">
                    <div>
                        <Badge
                            className={
                                application.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : application.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : application.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                            }
                            variant={application.status === 'approved' ? 'secondary' : 'default'}
                        >
                            {application.status}
                        </Badge>
                    </div>

                    <div>
                        <Button shape="rounded" variant="outline" className="">
                            <Pencil />
                            Edit Application
                        </Button>
                    </div>
                </header>
                <div className="bg-white p-4 shadow">
                    <section className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={undefined} width={80} height={80} className="h-20 w-20 object-cover" />
                            <AvatarFallback className="flex h-20 w-20 items-center justify-center text-4xl">
                                {application.first_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold">
                                {application.first_name} {application.middle_name} {application.last_name} {application.suffix}
                            </h1>
                            <small>{application.account_number}</small>
                        </div>
                    </section>

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
                                <strong>Customer Type:</strong> {application.customer_type?.full_text}
                            </p>
                            <p>
                                <strong>Connected Load:</strong> {application.connected_load}
                            </p>
                            <p>
                                <strong>District:</strong> {application.district}
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
                    <div className="mt-4 text-sm text-gray-500">
                        <p>
                            <strong>Submitted At:</strong> {new Date(application.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </AppLayout>
        </main>
    );
}
