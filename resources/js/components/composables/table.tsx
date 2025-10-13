import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

interface TableProps {
    children: ReactNode;
    className?: string;
}

interface TableRowProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    col: number;
}

export function Table({ children, className = '' }: TableProps) {
    return <div className={cn('relative overflow-hidden rounded-xl border', className)}>{children}</div>;
}

export function TableHeader({ children, col }: { children: ReactNode; col: number }) {
    return (
        <div
            className={cn(
                'text-weak hidden border-b px-5 pt-4 pb-3 text-sm font-medium md:grid',
                `md:[grid-template-columns:repeat(${col},minmax(0,1fr))_60px]`,
            )}
        >
            {children}
        </div>
    );
}

export function TableBody({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'divide-y divide-gray-200 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-button]:hidden',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function TableRow({ children, className = '', col, ...rest }: TableRowProps) {
    return (
        <div className={cn('relative cursor-pointer px-6 py-4 hover:bg-gray-50', className)} {...rest}>
            <div className={cn('grid gap-3 md:items-center', `md:[grid-template-columns:repeat(${col},minmax(0,1fr))_60px]`)}>{children}</div>
        </div>
    );
}

export function TableFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col items-center justify-between gap-3 border-t px-6 py-3 text-sm font-medium md:flex-row', className)}>
            {children}
        </div>
    );
}

export function TableData({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={cn('truncate text-sm text-gray-700', className)}>{children}</div>;
}
