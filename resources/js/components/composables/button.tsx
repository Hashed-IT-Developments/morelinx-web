'use client';

import { Button as ButtonComponent } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<'button'> {
    id?: string;
    name?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'default' | 'link' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null | undefined;
    size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
    shape?: 'circle' | 'rounded' | 'square' | string;
}

export default function Button({ id, name, size, variant = 'default', type = 'submit', children, shape, className, ...rest }: Props) {
    return (
        <ButtonComponent
            id={id}
            name={name}
            type={type}
            size={size}
            variant={variant}
            className={cn(
                className,
                shape === 'square' && 'rounded-none',
                shape === 'rounded' && 'rounded-3xl',
                shape === 'circle' && 'rounded-full',
            )}
            {...rest}
        >
            {children}
        </ButtonComponent>
    );
}
