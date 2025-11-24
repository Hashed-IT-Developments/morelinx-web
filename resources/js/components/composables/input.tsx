import { Input as ShadCnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ComponentProps, forwardRef } from 'react';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface BaseInputProps {
    name?: string;
    icon?: React.ReactNode;
    icon_placement?: 'left' | 'right';
    label?: string;
    placeholder?: string;
    className?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

interface InputProps extends BaseInputProps, Omit<ComponentProps<'input'>, 'type'> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
}

interface TextareaProps extends BaseInputProps, ComponentProps<'textarea'> {
    type: 'textarea';
    rows?: number;
}

type CombinedProps = InputProps | TextareaProps;

const Input = forwardRef<InputElement, CombinedProps>(
    ({ name, label, placeholder, icon, icon_placement = 'left', className, type = 'text', error, helperText, required, ...rest }, ref) => {
        const isTextarea = type === 'textarea';
        const hasError = Boolean(error);

        return (
            <div className="flex w-full flex-col gap-1">
                <div className="mb-px flex">
                    {label && (
                        <Label htmlFor={name} className={cn(hasError && 'text-destructive')}>
                            {label}
                        </Label>
                    )}

                    {required && <span className="ml-1 text-destructive">*</span>}
                </div>

                <div className="relative flex w-full items-center">
                    {icon && icon_placement === 'left' && !isTextarea && (
                        <span
                            className={cn(
                                'pointer-events-none absolute left-3 flex items-center text-muted-foreground',
                                hasError && 'text-destructive',
                            )}
                        >
                            {icon}
                        </span>
                    )}

                    {isTextarea ? (
                        <Textarea
                            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                            name={name}
                            placeholder={placeholder}
                            className={cn(hasError && 'border-destructive focus-visible:ring-destructive', className, 'w-full')}
                            {...(rest as ComponentProps<'textarea'>)}
                        />
                    ) : (
                        <ShadCnInput
                            ref={ref as React.ForwardedRef<HTMLInputElement>}
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            className={cn(
                                icon && icon_placement === 'left' && 'pl-8',
                                icon && icon_placement === 'right' && 'pr-8',
                                hasError && 'w-full border-destructive focus-visible:ring-destructive',
                                'w-full',
                                className,
                            )}
                            {...(rest as ComponentProps<'input'>)}
                        />
                    )}

                    {icon && icon_placement === 'right' && !isTextarea && (
                        <span
                            className={cn(
                                'pointer-events-none absolute right-3 flex items-center text-muted-foreground',
                                hasError && 'text-destructive',
                            )}
                        >
                            {icon}
                        </span>
                    )}
                </div>

                {(error || helperText) && (
                    <p className={cn('text-xs', hasError ? 'text-destructive italic' : 'text-muted-foreground')}>{error || helperText}</p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

export default Input;
