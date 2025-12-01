import { cn } from '@/lib/utils';
import React from 'react';

interface SectionHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export default function SectionHeader({ className = '', children }: SectionHeaderProps) {
    return <header className={cn('flex items-center justify-between p-5', className)}>{children}</header>;
}
