import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';
import Button from './button';

interface TableProps {
    children: ReactNode;
    className?: string;
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
    col: number;
}

interface TableRowProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    col: number;
}

interface TableDataProps {
    children: ReactNode;
    tooltip?: string;
    className?: string;
}

interface TableFooterProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return <div className={cn('relative overflow-hidden sm:rounded-xl sm:border', className)}>{children}</div>;
}

export function TableHeader({ children, col, className = '' }: TableHeaderProps) {
    const [colCount, setColCount] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setColCount(col);
    }, [col]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    return (
        <div
            className={cn('text-weak hidden border-b px-3 pt-4 pb-3 text-sm font-medium sm:grid sm:px-5', className)}
            style={{ gridTemplateColumns: isDesktop ? `repeat(${colCount}, minmax(0, 1fr)) 60px` : 'auto' }}
        >
            {children}
        </div>
    );
}

export function TableBody({ children, className = '' }: TableBodyProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
            setShowScrollButton(!atBottom);
        };

        handleScroll();
        el.addEventListener('scroll', handleScroll);

        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToBottom = () => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="relative">
            <div ref={containerRef} className={cn('scrollbar-thin flex flex-col gap-4 divide-y divide-gray-200 overflow-y-auto sm:gap-0', className)}>
                {children}
            </div>

            {showScrollButton && (
                <div className="pointer-events-none absolute right-0 bottom-3 left-0 flex justify-center">
                    <Button variant="outline" size="icon" shape="circle" onClick={scrollToBottom} className="pointer-events-auto shadow-md">
                        <ArrowDown />
                    </Button>
                </div>
            )}
        </div>
    );
}
export function TableRow({ children, className = '', col, ...rest }: TableRowProps) {
    const [colCount, setColCount] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setColCount(col);
    }, [col]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    return (
        <div
            className={cn(
                'relative cursor-pointer border px-3 py-3 shadow-md hover:bg-gray-50 sm:border-b sm:border-none sm:px-6 sm:py-4 sm:shadow-none',
            )}
            {...rest}
        >
            <div
                className={cn(`grid items-center gap-2 sm:grid sm:gap-3`, className)}
                style={{ gridTemplateColumns: isDesktop ? `repeat(${colCount}, minmax(0, 1fr)) 60px` : 'auto' }}
            >
                {children}
            </div>
        </div>
    );
}
export function TableData({ children, tooltip, className = '' }: TableDataProps) {
    return (
        <>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger>
                        <div className={cn('mb-1 flex w-full text-left text-sm text-gray-700 sm:col-span-1 sm:mb-0', className)}>{children}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <div className={cn('mb-1 flex w-full text-left text-sm text-gray-700 sm:col-span-1 sm:mb-0', className)}>{children}</div>
            )}
        </>
    );
}

export function TableFooter({ children, className = '' }: TableFooterProps) {
    return (
        <div className={cn('flex flex-col items-center justify-between gap-3 border-t px-3 py-3 text-sm font-medium sm:px-6 md:flex-row', className)}>
            {children}
        </div>
    );
}
