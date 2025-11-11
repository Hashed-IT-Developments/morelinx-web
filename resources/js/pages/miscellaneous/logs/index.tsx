import Pagination from '@/components/composables/pagination';
import { Table, TableBody, TableData, TableFooter, TableHeader, TableRow } from '@/components/composables/table';
import AppLayout from '@/layouts/app-layout';
import { WhenVisible } from '@inertiajs/react';
import moment from 'moment';

interface LogsIndexProps {
    logs: PaginatedData & {
        data: Logs[];
    };
}
export default function LogsIndex({ logs }: LogsIndexProps) {
    console.log(logs);
    const breadcrumbs = [
        { title: 'Miscellaneous', href: '#' },
        { title: 'Logs', href: '/miscellaneous/logs' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <section className="space-y-4 p-4">
                <Table>
                    <TableHeader col={5}>
                        <TableData>Title</TableData>
                        <TableData>Description</TableData>
                        <TableData>Type</TableData>
                        <TableData>Logged by</TableData>
                        <TableData>Date & Time</TableData>
                    </TableHeader>

                    <TableBody className="h-[calc(100vh-15rem)] sm:h-[calc(100vh-14rem)]">
                        <WhenVisible
                            data="logs"
                            fallback={() => (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-gray-500">
                                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                                </div>
                            )}
                        >
                            {logs?.data.map((log: Logs) => (
                                <TableRow key={log.id} col={5}>
                                    <TableData>{log.title}</TableData>
                                    <TableData>{log.description}</TableData>
                                    <TableData>{log.type}</TableData>
                                    <TableData>{log.user.name}</TableData>
                                    <TableData>{moment(log.created_at).format('MMMM Do YYYY, h:mm:ss a')}</TableData>
                                </TableRow>
                            ))}
                        </WhenVisible>
                    </TableBody>
                    <TableFooter>
                        <Pagination pagination={logs} />
                    </TableFooter>
                </Table>
            </section>
        </AppLayout>
    );
}
