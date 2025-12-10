import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ColumnDefinition } from '@/components/ui/paginated-table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStatusUtils } from '@/lib/status-utils';
import { useEffect, useMemo, useState } from 'react';

interface CustomerApplication {
    id: number;
    account_number?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    full_name?: string;
    email_address?: string;
    mobile_1?: string;
    mobile_2?: string;
    tel_no_1?: string;
    tel_no_2?: string;
    barangay?: string;
    town?: string;
    district?: string;
    customer_type?: string;
    connected_load?: number;
    property_ownership?: string;
    is_sc?: boolean;
    is_isnap?: boolean;
    sitio?: string;
    unit_no?: string;
    building?: string;
    street?: string;
    subdivision?: string;
    landmark?: string;
    full_address?: string;
    sketch_lat_long?: string;
}

interface Inspection {
    id: number;
    inspection_id: number;
    customer: string;
    status: string;
    customer_type: string;
    address: string;
    schedule_date: string;
    inspector?: string;
    inspector_email?: string;
    customer_application?: CustomerApplication;
}

interface InspectionDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inspections: Inspection[];
    title: string;
}

export default function InspectionDetailsModal({ open, onOpenChange, inspections, title }: InspectionDetailsModalProps) {
    const { getStatusLabel, getStatusColor } = useStatusUtils();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when inspections change
    useEffect(() => {
        setCurrentPage(1);
    }, [inspections]);

    // Calculate pagination
    const totalPages = Math.ceil(inspections.length / itemsPerPage);
    const paginatedInspections = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return inspections.slice(startIndex, endIndex);
    }, [inspections, currentPage, itemsPerPage]);

    const columns: ColumnDefinition[] = [
        {
            key: 'customer_application.account_number',
            header: 'Account #',
            className: 'text-xs font-medium sticky-col-1',
        },
        {
            key: 'customer',
            header: 'Customer Name',
            className: 'text-xs font-medium sticky-col-2',
        },
        {
            key: 'status',
            header: 'Status',
            className: 'text-xs',
            render: (value) => (
                <Badge variant="outline" className={`${getStatusColor(value as string)} text-xs font-medium`}>
                    {getStatusLabel(value as string)}
                </Badge>
            ),
        },
        {
            key: 'schedule_date',
            header: 'Schedule Date',
            className: 'text-xs',
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : 'N/A',
        },
        {
            key: 'customer_application.email_address',
            header: 'Email',
            className: 'text-xs',
        },
        {
            key: 'customer_application.mobile_1',
            header: 'Mobile 1',
            className: 'text-xs',
        },
        {
            key: 'customer_application.mobile_2',
            header: 'Mobile 2',
            className: 'text-xs',
        },
        {
            key: 'customer_application.tel_no_1',
            header: 'Tel 1',
            className: 'text-xs',
        },
        {
            key: 'customer_application.tel_no_2',
            header: 'Tel 2',
            className: 'text-xs',
        },
        {
            key: 'customer_type',
            header: 'Customer Type',
            className: 'text-xs',
        },
        {
            key: 'customer_application.town',
            header: 'Town',
            className: 'text-xs',
        },
        {
            key: 'customer_application.district',
            header: 'District',
            className: 'text-xs',
        },
        {
            key: 'customer_application.sitio',
            header: 'Sitio',
            className: 'text-xs',
        },
        {
            key: 'customer_application.street',
            header: 'Street',
            className: 'text-xs',
        },
        {
            key: 'customer_application.building',
            header: 'Building',
            className: 'text-xs',
        },
        {
            key: 'customer_application.unit_no',
            header: 'Unit No.',
            className: 'text-xs',
        },
        {
            key: 'customer_application.subdivision',
            header: 'Subdivision',
            className: 'text-xs',
        },
        {
            key: 'customer_application.landmark',
            header: 'Landmark',
            className: 'text-xs',
        },
        {
            key: 'customer_application.barangay',
            header: 'Barangay',
            className: 'text-xs',
        },
        {
            key: 'address',
            header: 'Full Address',
            className: 'text-xs',
        },
        {
            key: 'customer_application.property_ownership',
            header: 'Property Ownership',
            className: 'text-xs',
        },
        {
            key: 'customer_application.connected_load',
            header: 'Connected Load (kW)',
            className: 'text-xs',
        },
        {
            key: 'customer_application.is_sc',
            header: 'Senior Citizen',
            className: 'text-xs',
            render: (value) => (value ? 'Yes' : 'No'),
        },
        {
            key: 'customer_application.is_isnap',
            header: 'ISNAP',
            className: 'text-xs',
            render: (value) => (value ? 'Yes' : 'No'),
        },
        {
            key: 'inspector',
            header: 'Inspector',
            className: 'text-xs',
        },
    ];

    const getValueFromPath = (obj: Record<string, unknown>, path: string): unknown => {
        return path.split('.').reduce((current: unknown, key: string) => {
            if (current && typeof current === 'object' && key in current) {
                return (current as Record<string, unknown>)[key];
            }
            return undefined;
        }, obj);
    };

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near the start
                pages.push(2, 3, 4, 'ellipsis', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // In the middle
                pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] w-[70vw] !max-w-none p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                </DialogHeader>

                <style>{`
                    .sticky-col-1 {
                        position: sticky !important;
                        left: 0;
                        z-index: 21;
                        background: white !important;
                        border-right: 1px solid hsl(var(--border));
                    }
                    .sticky-col-2 {
                        position: sticky !important;
                        left: 150px;
                        z-index: 21;
                        background: white !important;
                        border-right: 1px solid hsl(var(--border));
                    }
                    .bg-muted\\/50 .sticky-col-1,
                    .bg-muted\\/50 .sticky-col-2, {
                        background: hsl(var(--muted) / 0.5) !important;
                    }
                    tr:hover .sticky-col-1,
                    tr:hover .sticky-col-2, {
                        background: white !important;
                    }
                    tr:hover.bg-muted\\/30 .sticky-col-1,
                    tr:hover.bg-muted\\/30 .sticky-col-2, {
                        background: hsl(var(--muted) / 0.3) !important;
                    }
                `}</style>

                <div className="max-h-[calc(90vh-14rem)] overflow-auto rounded-md border">
                    {paginatedInspections.length > 0 ? (
                        <Table className="w-full">
                            <TableHeader className="sticky top-0 z-30">
                                <TableRow className="bg-muted/50">
                                    {columns.map((column, index) => (
                                        <TableHead
                                            key={column.key}
                                            className={`h-9 px-4 text-xs font-semibold whitespace-nowrap ${
                                                index === 0
                                                    ? 'sticky-col-1 w-[150px] min-w-[150px]'
                                                    : index === 1
                                                      ? 'sticky-col-2 w-[200px] min-w-[200px]'
                                                      : index === 2
                                                        ? 'sticky-col-3 w-[180px] min-w-[180px]'
                                                        : 'min-w-[150px]'
                                            }`}
                                        >
                                            {column.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedInspections.map((inspection) => (
                                    <TableRow key={inspection.id} className="text-xs hover:bg-muted/30">
                                        {columns.map((column, index) => {
                                            const value = getValueFromPath(inspection as unknown as Record<string, unknown>, column.key);
                                            return (
                                                <TableCell
                                                    key={column.key}
                                                    className={`px-4 py-2 whitespace-nowrap ${
                                                        index === 0
                                                            ? 'sticky-col-1 w-[150px] min-w-[150px]'
                                                            : index === 1
                                                              ? 'sticky-col-2 w-[200px] min-w-[200px]'
                                                              : index === 2
                                                                ? 'sticky-col-3 w-[180px] min-w-[180px]'
                                                                : 'min-w-[150px]'
                                                    } ${column.className || ''}`}
                                                >
                                                    {column.render
                                                        ? column.render(value, inspection as unknown as Record<string, unknown>, 0)
                                                        : (value as string) || 'N/A'}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">No inspection data available</div>
                    )}
                </div>

                {/* Pagination Controls */}
                {inspections.length > 0 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, inspections.length)} of{' '}
                            {inspections.length} results
                        </div>
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            size="sm"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) {
                                                    setCurrentPage(currentPage - 1);
                                                }
                                            }}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                    {pageNumbers.map((page, index) =>
                                        page === 'ellipsis' ? (
                                            <PaginationItem key={`ellipsis-${index}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    size="sm"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(page);
                                                    }}
                                                    isActive={page === currentPage}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ),
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            size="sm"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) {
                                                    setCurrentPage(currentPage + 1);
                                                }
                                            }}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
