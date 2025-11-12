'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { ChangeEvent, ComponentProps, KeyboardEvent, forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as ShadSelect } from '../ui/select';

interface Option {
    label: string;
    value: string;
    disabled?: boolean;
}

interface SelectProps extends Omit<ComponentProps<typeof ShadSelect>, 'children'> {
    label?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    options: Option[];
    searchable?: boolean;
    className?: string;
    contentClassName?: string;
    error?: string;
    helperText?: string;
    emptyText?: string;
    searchPlaceholder?: string;
    maxHeight?: string;
    type?: 'select' | 'dropdown' | 'radio';
    multiple?: boolean;
    selectedValues?: string[] | string;
    onMultipleChange?: (values: string[]) => void;
}

const Select = forwardRef<React.ElementRef<typeof ShadSelect>, SelectProps>(
    (
        {
            label,
            id,
            name,
            placeholder = 'Select an option',
            options = [],
            searchable = false,
            className,
            contentClassName,
            error,
            helperText,
            emptyText = 'No options available',
            searchPlaceholder = 'Search options...',
            maxHeight = 'max-h-52',
            multiple = false,
            selectedValues = [],
            onMultipleChange,
            ...rest
        },
        ref,
    ) => {
        const normalizedSelectedValues = useMemo(() => {
            if (Array.isArray(selectedValues)) {
                return selectedValues;
            }
            return selectedValues ? [selectedValues] : [];
        }, [selectedValues]);

        const [query, setQuery] = useState('');
        const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(normalizedSelectedValues);
        const inputRef = useRef<HTMLInputElement>(null);
        const reactId = useId();
        const elementId = id ?? `select-${reactId}`;
        const searchId = `${elementId}-search`;

        const hasError = Boolean(error);

        const prevSelectedValuesRef = useRef(normalizedSelectedValues);
        if (JSON.stringify(prevSelectedValuesRef.current) !== JSON.stringify(normalizedSelectedValues)) {
            setInternalSelectedValues(normalizedSelectedValues);
            prevSelectedValuesRef.current = normalizedSelectedValues;
        }

        const filteredOptions = useMemo(() => {
            if (!query.trim()) return options;

            const lowerQuery = query.toLowerCase();
            return options.filter((option) => option.label.toLowerCase().includes(lowerQuery));
        }, [options, query]);

        const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
        }, []);

        const handleSearchKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
            e.stopPropagation();

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
            }
        }, []);

        const handleOpenChange = useCallback(
            (open: boolean) => {
                if (!open) {
                    setQuery('');
                }
                rest.onOpenChange?.(open);
            },
            [rest],
        );

        const handleMultipleToggle = useCallback(
            (value: string, checked: boolean) => {
                let newValues: string[];

                if (multiple) {
                    newValues = checked ? [...internalSelectedValues, value] : internalSelectedValues.filter((v) => v !== value);
                } else {
                    newValues = checked ? [value] : [];
                }

                setInternalSelectedValues(newValues);
                onMultipleChange?.(newValues);
            },
            [internalSelectedValues, onMultipleChange, multiple],
        );

        const getSelectedLabels = useCallback(() => {
            const selectedOptions = options.filter((option) => internalSelectedValues.includes(option.value));
            return selectedOptions.map((option) => option.label).join(', ');
        }, [options, internalSelectedValues]);

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <Label htmlFor={elementId} className={cn(hasError && 'text-destructive')}>
                        {label}
                    </Label>
                )}

                {rest.type === 'radio' ? (
                    <RadioGroup defaultValue={rest.defaultValue} onValueChange={rest.onValueChange} value={rest.value}>
                        {filteredOptions.map((option, index) => (
                            <div key={`${elementId}-${index}`} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`${elementId}-${option.value}`} disabled={option.disabled} />
                                <Label htmlFor={`${elementId}-${option.value}`}>{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                ) : multiple ? (
                    <div className="space-y-2">
                        {searchable && (
                            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                <Search size={16} className="text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    id={searchId}
                                    type="text"
                                    value={query}
                                    onChange={handleSearchChange}
                                    placeholder={searchPlaceholder}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    aria-label="Search options"
                                    autoComplete="off"
                                />
                            </div>
                        )}
                        <div className={cn('space-y-2', maxHeight, 'overflow-auto')}>
                            {filteredOptions.length === 0 ? (
                                <div className="flex items-center justify-center p-6 text-center">
                                    <span className="text-sm text-muted-foreground">{query ? `No results found for "${query}"` : emptyText}</span>
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div key={`${elementId}-${index}`} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${elementId}-${option.value}`}
                                            checked={internalSelectedValues.includes(option.value)}
                                            onCheckedChange={(checked) => handleMultipleToggle(option.value, checked as boolean)}
                                            disabled={option.disabled}
                                        />
                                        <Label htmlFor={`${elementId}-${option.value}`} className="cursor-pointer text-sm font-normal">
                                            {option.label}
                                        </Label>
                                    </div>
                                ))
                            )}
                        </div>
                        {internalSelectedValues.length > 0 && <div className="text-xs text-muted-foreground">Selected: {getSelectedLabels()}</div>}
                    </div>
                ) : (
                    <ShadSelect {...rest} name={name} onOpenChange={handleOpenChange}>
                        <SelectTrigger
                            ref={ref}
                            id={elementId}
                            className={cn('w-full', hasError && 'border-destructive focus:ring-destructive', className)}
                            aria-describedby={error ? `${elementId}-error` : helperText ? `${elementId}-helper` : undefined}
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>

                        <SelectContent className={cn('p-0', contentClassName)} position="popper" sideOffset={4}>
                            {searchable && (
                                <div className="sticky top-0 z-50 border-b bg-background p-3">
                                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                        <Search size={16} className="text-muted-foreground" />
                                        <input
                                            ref={inputRef}
                                            id={searchId}
                                            type="text"
                                            value={query}
                                            onChange={handleSearchChange}
                                            onKeyDown={handleSearchKeyDown}
                                            placeholder={searchPlaceholder}
                                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                            aria-label="Search options"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={cn('overflow-auto', maxHeight)}>
                                {filteredOptions.length === 0 ? (
                                    <div className="flex items-center justify-center p-6 text-center">
                                        <span className="text-sm text-muted-foreground">{query ? `No results found for "${query}"` : emptyText}</span>
                                    </div>
                                ) : (
                                    filteredOptions.map((option, index) => (
                                        <SelectItem key={`${id}-${index}`} value={option.value} disabled={option.disabled} className="cursor-pointer">
                                            {option.label}
                                        </SelectItem>
                                    ))
                                )}
                            </div>
                        </SelectContent>
                    </ShadSelect>
                )}

                {(error || helperText) && (
                    <p
                        id={error ? `${elementId}-error` : `${elementId}-helper`}
                        className={cn('text-sm', hasError ? 'text-destructive' : 'text-muted-foreground')}
                        role={hasError ? 'alert' : undefined}
                        aria-live={hasError ? 'polite' : undefined}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    },
);

Select.displayName = 'Select';

export default Select;
