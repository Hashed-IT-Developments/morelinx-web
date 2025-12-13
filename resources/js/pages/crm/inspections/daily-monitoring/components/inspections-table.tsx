import Button from '@/components/composables/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStatusUtils } from '@/lib/status-utils';
import { Inspection } from '@/types/monitoring-types';
import { Eye } from 'lucide-react';

interface InspectionsTableProps {
    inspections: Inspection[];
    emptyMessage?: string;
    onRowClick?: (inspection: Inspection) => void;
    onView?: (inspection: Inspection) => void;
}

export function InspectionsTable({ inspections, emptyMessage = 'No inspections found', onRowClick, onView }: InspectionsTableProps) {
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
                        <TableHead className="h-9 text-xs">Action</TableHead>
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
                                <TableCell className="py-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView?.(inspection);
                                        }}
                                    >
                                        <Eye className="h-3 w-3" />
                                        <span className="hidden sm:inline">View</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-xs text-gray-500">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
