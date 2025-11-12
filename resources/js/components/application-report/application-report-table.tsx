import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStatusUtils } from '@/lib/status-utils';
import { Application } from '../../types/application-report-types';

interface ApplicationReportTableProps {
    applications: Application[];
    emptyMessage?: string;
    onRowClick?: (application: Application) => void;
}

export function ApplicationReportTable({ applications, emptyMessage = 'No applications found', onRowClick }: ApplicationReportTableProps) {
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="h-9 text-xs">ID</TableHead>
                        <TableHead className="h-9 text-xs">Account Number</TableHead>
                        <TableHead className="h-9 text-xs">Customer Name</TableHead>
                        <TableHead className="h-9 text-xs">Rate Class</TableHead>
                        <TableHead className="h-9 text-xs">Status</TableHead>
                        <TableHead className="h-9 text-xs">Town</TableHead>
                        <TableHead className="h-9 text-xs">Barangay</TableHead>
                        <TableHead className="h-9 text-xs">Load (kW)</TableHead>
                        <TableHead className="h-9 text-xs">Date Applied</TableHead>
                        <TableHead className="h-9 text-xs">Date Installed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.length > 0 ? (
                        applications.map((application) => (
                            <TableRow
                                key={application.id}
                                className="cursor-pointer text-xs transition-colors hover:bg-muted/50"
                                onClick={() => onRowClick?.(application)}
                            >
                                <TableCell className="py-2 font-medium">{application.id}</TableCell>
                                <TableCell className="py-2">{application.account_number}</TableCell>
                                <TableCell className="py-2">{application.customer_name}</TableCell>
                                <TableCell className="py-2 capitalize">{application.rate_class}</TableCell>
                                <TableCell className="py-2">
                                    <Badge variant="outline" className={`${getStatusColor(application.status)} text-xs font-medium`}>
                                        {getStatusLabel(application.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2">{application.town}</TableCell>
                                <TableCell className="py-2">{application.barangay}</TableCell>
                                <TableCell className="py-2 text-right">{application.load}</TableCell>
                                <TableCell className="py-2">{application.date_applied}</TableCell>
                                <TableCell className="py-2">{application.date_installed}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center text-xs text-gray-500">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
