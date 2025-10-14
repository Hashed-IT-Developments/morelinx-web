import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Tickets() {
    const breadcrumbs = [{ title: 'Tickets', href: '/tickets' }];
    return (
        <main>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Tickets" />
                <div className="">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tickets</h1>
                    <div className="mt-6">
                        <p className="text-gray-600 dark:text-gray-300">This is the tickets page.</p>
                    </div>
                </div>
            </AppLayout>
        </main>
    );
}
