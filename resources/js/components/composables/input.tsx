import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input as ShadCnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { ComponentProps, forwardRef, useEffect, useState } from 'react';

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
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // <- type-safe
}

interface InputProps extends BaseInputProps, Omit<ComponentProps<'input'>, 'type' | 'onChange'> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'date';
}

interface TextareaProps extends BaseInputProps, Omit<ComponentProps<'textarea'>, 'onChange'> {
    type: 'textarea';
    rows?: number;
}

interface DateInputProps extends BaseInputProps {
    type: 'date';
    value?: Date;
    onDateChange?: (date: Date | undefined) => void;
}

type CombinedProps = InputProps | TextareaProps | DateInputProps;

const Input = forwardRef<InputElement, CombinedProps>(
    ({ name, label, placeholder, icon, icon_placement = 'left', className, type = 'text', error, helperText, required, onChange, ...rest }, ref) => {
        const isTextarea = type === 'textarea';
        const isDate = type === 'date';
        const hasError = Boolean(error);

        const [date, setDate] = useState<Date | undefined>(isDate && 'value' in rest ? (rest.value as Date) : undefined);

        const handleDateChange = (newDate: Date | undefined) => {
            setDate(newDate);
            if (isDate && 'onDateChange' in rest && rest.onDateChange) {
                rest.onDateChange(newDate);
            }
        };

        useEffect(() => {
            if (isDate && 'value' in rest) {
                setDate(rest.value as Date | undefined);
            }

            //eslint-disable-next-line react-hooks/exhaustive-deps
        }, [rest.value, isDate]);

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <div className="mb-px flex">
                        <Label htmlFor={name} className={cn(hasError && 'text-destructive')}>
                            {label}
                        </Label>
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </div>
                )}

                <div className="relative flex items-center">
                    {icon && icon_placement === 'left' && !isTextarea && !isDate && (
                        <span
                            className={cn(
                                'pointer-events-none absolute left-3 flex items-center text-muted-foreground',
                                hasError && 'text-destructive',
                            )}
                        >
                            {icon}
                        </span>
                    )}

                    {isDate ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!date}
                                    className={cn(
                                        'w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground',
                                        hasError && 'border-destructive focus-visible:ring-destructive',
                                        className,
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP') : <span>{placeholder || 'Pick a date'}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={handleDateChange} />
                            </PopoverContent>
                        </Popover>
                    ) : isTextarea ? (
                        <Textarea
                            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                            name={name}
                            placeholder={placeholder}
                            className={cn(hasError && 'border-destructive focus-visible:ring-destructive', className, 'w-full')}
                            onChange={onChange}
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
                                hasError && 'border-destructive focus-visible:ring-destructive',
                                className,
                            )}
                            onChange={onChange}
                            {...(rest as ComponentProps<'input'>)}
                        />
                    )}

                    {icon && icon_placement === 'right' && !isTextarea && !isDate && (
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
