'use client';

import { Button as ShadCnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<'button'> {
    id?: string;
    name?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'default' | 'link' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null | undefined;
    size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
    shape?: 'circle' | 'rounded' | 'square' | string;
    mode?: 'success' | 'danger' | 'warning' | 'info';
}

export default function Button({ id, name, size, variant = 'default', type = 'submit', children, shape, className, mode, ...rest }: Props) {
    return (
        <ShadCnButton
            id={id}
            name={name}
            type={type}
            size={size}
            variant={variant}
            className={cn(
                'cursor-pointer',
                className,
                shape === 'square' && 'rounded-none',
                shape === 'rounded' && 'rounded-3xl',
                shape === 'circle' && 'rounded-full',
                mode &&
                    {
                        success: {
                            ghost: 'text-[var(--color-success)] hover:bg-[var(--color-success)]/10 hover:text-[var(--color-success)]',
                            outline:
                                'border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-[var(--color-success-foreground)]',
                            secondary:
                                'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 hover:text-[var(--color-success)]',
                            link: 'text-[var(--color-success)] hover:text-[var(--color-success)]/90',
                            destructive:
                                'bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success-primary)] hover:text-[var(--color-success-foreground)]',
                            default:
                                'bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success-primary)] hover:text-[var(--color-success-foreground)]',
                        },
                        warning: {
                            ghost: 'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 hover:text-[var(--color-warning)]',
                            outline:
                                'border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-[var(--color-warning-foreground)]',
                            secondary:
                                'bg-[var(--color-warning)]/10 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 hover:text-[var(--color-warning)]',
                            link: 'text-[var(--color-warning)] hover:text-[var(--color-warning)]/90',
                            destructive:
                                'bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning-primary)] hover:text-[var(--color-warning-foreground)]',
                            default:
                                'bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning-primary)] hover:text-[var(--color-warning-foreground)]',
                        },
                        info: {
                            ghost: 'text-[var(--color-info)] hover:bg-[var(--color-info)]/10 hover:text-[var(--color-info)]',
                            outline:
                                'border-[var(--color-info)] text-[var(--color-info)] hover:bg-[var(--color-info)] hover:text-[var(--color-info-foreground)]',
                            secondary:
                                'bg-[var(--color-info)]/10 text-[var(--color-info)] hover:bg-[var(--color-info)]/20 hover:text-[var(--color-info)]',
                            link: 'text-[var(--color-info)] hover:text-[var(--color-info)]/90',
                            destructive:
                                'bg-[var(--color-info)] text-[var(--color-info-foreground)] hover:bg-[var(--color-info-primary)] hover:text-[var(--color-info-foreground)]',
                            default:
                                'bg-[var(--color-info)] text-[var(--color-info-foreground)] hover:bg-[var(--color-info-primary)] hover:text-[var(--color-info-foreground)]',
                        },
                        danger: {
                            ghost: 'text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]',
                            outline:
                                'border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-[var(--color-danger-foreground)]',
                            secondary:
                                'bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)]',
                            link: 'text-[var(--color-danger)] hover:text-[var(--color-danger)]/90',
                            destructive:
                                'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-primary)] hover:text-[var(--color-danger-foreground)]',
                            default:
                                'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-primary)] hover:text-[var(--color-danger-foreground)]',
                        },
                    }[mode]?.[variant || 'default'],
            )}
            {...rest}
        >
            {children}
        </ShadCnButton>
    );
}
