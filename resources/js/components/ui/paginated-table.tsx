import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

// --- Type Definitions ---
export interface PaginationData {
    data: Record<string, unknown>[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: Array<{ url?: string; label: string; active: boolean }>;
}

export interface ColumnDefinition {
    key: string;
    header: string;
    sortable?: boolean;
    hiddenOnMobile?: boolean;
    hiddenOnTablet?: boolean;
    className?: string;
    headerClassName?: string;
    render?: (value: unknown, row: Record<string, unknown>, index: number) => ReactNode;
    mobileRender?: (value: unknown, row: Record<string, unknown>, index: number) => ReactNode;
}

export interface SortConfig {
    field?: string;
    direction?: 'asc' | 'desc';
}

export interface PaginatedTableProps {
    data: PaginationData;
    columns: ColumnDefinition[];
    title?: string;
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
    currentSort?: SortConfig;
    actions?: (row: Record<string, unknown>, index: number) => ReactNode;
    mobileCardRender?: (row: Record<string, unknown>, index: number) => ReactNode;
    rowClassName?: (row: Record<string, unknown>, index: number) => string;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
    showPagination?: boolean;
    onPageChange?: (url: string) => void;
}

// --- Helper Functions ---
const handlePageChange = (url: string, onPageChange?: (url: string) => void) => {
    if (onPageChange) {
        onPageChange(url);
    } else {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    }
};

const getSortIcon = (column: ColumnDefinition, currentSort?: SortConfig) => {
    if (!column.sortable || !currentSort?.field || currentSort.field !== column.key) {
        return null;
    }
    
    return currentSort.direction === 'asc' ? (
        <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
    );
};

const getValueFromPath = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((current: unknown, key: string) => {
        if (current && typeof current === 'object' && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
};

// --- Main Component ---
export function PaginatedTable({
    data,
    columns,
    title,
    onSort,
    currentSort,
    actions,
    mobileCardRender,
    rowClassName,
    emptyMessage = 'No data available',
    emptyIcon,
    showPagination = true,
    onPageChange,
}: PaginatedTableProps) {
    const handleSort = (column: ColumnDefinition) => {
        if (!column.sortable || !onSort) return;

        const isCurrentField = currentSort?.field === column.key;
        const newDirection = isCurrentField && currentSort?.direction === 'asc' ? 'desc' : 'asc';
        
        onSort(column.key, newDirection);
    };

    const renderCellValue = (column: ColumnDefinition, row: Record<string, unknown>, index: number) => {
        const value = getValueFromPath(row, column.key);
        
        if (column.render) {
            return column.render(value, row, index);
        }
        
        return (value as ReactNode) ?? '—';
    };

    const getResponsiveClasses = (column: ColumnDefinition) => {
        const classes = [];
        if (column.hiddenOnMobile) classes.push('hidden sm:table-cell');
        if (column.hiddenOnTablet) classes.push('hidden lg:table-cell');
        if (column.className) classes.push(column.className);
        return classes.join(' ');
    };

    const getHeaderClasses = (column: ColumnDefinition) => {
        const classes = ['font-semibold'];
        if (column.hiddenOnMobile) classes.push('hidden sm:table-cell');
        if (column.hiddenOnTablet) classes.push('hidden lg:table-cell');
        if (column.headerClassName) classes.push(column.headerClassName);
        if (column.sortable) classes.push('cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none');
        return classes.join(' ');
    };

    const renderEmptyState = () => (
        <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                {emptyIcon || (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )}
            </div>
            <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
    );

    return (
        <div className="space-y-4 min-h-[300px]">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <Card className="shadow-sm min-h-[250px]">
                    {title && (
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                        </CardHeader>
                    )}
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={getHeaderClasses(column)}
                                            onClick={() => handleSort(column)}
                                        >
                                            <div className="flex items-center">
                                                {column.header}
                                                {getSortIcon(column, currentSort)}
                                            </div>
                                        </TableHead>
                                    ))}
                                    {actions && <TableHead className="w-20 font-semibold">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length + (actions ? 1 : 0)}
                                            className="text-center py-16 text-gray-500"
                                        >
                                            {renderEmptyState()}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.data.map((row, index) => (
                                        <TableRow
                                            key={(row.id as string) || `row-${index}`}
                                            className={rowClassName ? rowClassName(row, index) : ''}
                                        >
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.key}
                                                    className={getResponsiveClasses(column)}
                                                >
                                                    {renderCellValue(column, row, index)}
                                                </TableCell>
                                            ))}
                                            {actions && (
                                                <TableCell>
                                                    {actions(row, index)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="space-y-3 lg:hidden">
                {data.data.length === 0 ? (
                    <Card className="shadow-sm min-h-[200px] flex items-center justify-center">
                        <CardContent className="p-8 text-center text-gray-500 w-full">
                            {renderEmptyState()}
                        </CardContent>
                    </Card>
                ) : (
                    data.data.map((row, index) => (
                        <Card
                            key={(row.id as string) || `card-${index}`}
                            className={`shadow-sm border-l-4 border-l-blue-500 transition-all hover:shadow-md hover:border-l-blue-600 ${
                                rowClassName ? rowClassName(row, index) : ''
                            }`}
                        >
                            {mobileCardRender ? (
                                mobileCardRender(row, index)
                            ) : (
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {columns
                                            .filter(col => !col.hiddenOnMobile)
                                            .map((column, colIndex) => (
                                                <div key={column.key} className={`${colIndex === 0 ? 'pb-2 border-b border-gray-100 dark:border-gray-700' : ''}`}>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                            {column.header}
                                                        </span>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                            {column.mobileRender 
                                                                ? column.mobileRender(getValueFromPath(row, column.key), row, index) as ReactNode
                                                                : renderCellValue(column, row, index)
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        {actions && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                                {actions(row, index)}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {showPagination && data.total > 0 && (
                <Card className="shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row">
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                                Showing <span className="font-medium text-gray-900 dark:text-gray-100">{data.from || 0}</span> to{' '}
                                <span className="font-medium text-gray-900 dark:text-gray-100">{data.to || 0}</span> of{' '}
                                <span className="font-medium text-gray-900 dark:text-gray-100">{data.total}</span> entries
                            </div>

                            <Pagination className="order-1 sm:order-2">
                                <PaginationContent className="flex-wrap justify-center">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const prevLink = data.links.find((link) => link.label === '&laquo; Previous');
                                                if (prevLink?.url) {
                                                    handlePageChange(prevLink.url, onPageChange);
                                                }
                                            }}
                                            className={`text-xs sm:text-sm ${
                                                data.current_page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        />
                                    </PaginationItem>

                                    {data.links.slice(1, -1).map((link, index) => {
                                        if (link.label === '...') {
                                            return (
                                                <PaginationItem key={`ellipsis-${index}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        return (
                                            <PaginationItem key={link.label}>
                                                <PaginationLink
                                                    href="#"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (link.url) {
                                                            handlePageChange(link.url, onPageChange);
                                                        }
                                                    }}
                                                    isActive={link.active}
                                                    className={`cursor-pointer transition-colors text-xs sm:text-sm min-w-[2rem] h-8 ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const nextLink = data.links.find((link) => link.label === 'Next &raquo;');
                                                if (nextLink?.url) {
                                                    handlePageChange(nextLink.url, onPageChange);
                                                }
                                            }}
                                            className={`text-xs sm:text-sm ${
                                                data.current_page === data.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default PaginatedTable;