import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStatusUtils } from '@/lib/status-utils';
import { Inspection } from '../../types/monitoring-types';

interface InspectionsTableProps {
    inspections: Inspection[];
    emptyMessage?: string;
    onRowClick?: (inspection: Inspection) => void;
}

export function InspectionsTable({ inspections, emptyMessage = 'No inspections found', onRowClick }: InspectionsTableProps) {
    const { getStatusLabel, getStatusColor } = useStatusUtils();

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="h-9 text-xs">Customer</TableHead>
                        <TableHead className="h-9 text-xs">Status</TableHead>
                        <TableHead className="h-9 text-xs">Customer Type</TableHead>
                        <TableHead className="h-9 text-xs">Address</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inspections.length > 0 ? (
                        inspections.map((inspection) => (
                            <TableRow
                                key={inspection.id}
                                className="cursor-pointer text-xs transition-colors hover:bg-muted/50"
                                onClick={() => onRowClick?.(inspection)}
                            >
                                <TableCell className="py-2 font-medium">{inspection.customer}</TableCell>
                                <TableCell className="py-2">
                                    <Badge variant="outline" className={`${getStatusColor(inspection.status)} text-xs font-medium`}>
                                        {getStatusLabel(inspection.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-2">{inspection.customer_type}</TableCell>
                                <TableCell className="py-2 text-xs">{inspection.address}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
