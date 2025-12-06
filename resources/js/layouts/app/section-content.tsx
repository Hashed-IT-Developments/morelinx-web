import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

type SectionContentProps = PropsWithChildren<{
    className?: string;
}>;

export default function SectionContent({ children, className }: SectionContentProps) {
    return <section className={cn('h-[calc(100vh-9rem)] w-full overflow-y-scroll scroll-smooth p-5 pt-0', className)}>{children}</section>;
}
