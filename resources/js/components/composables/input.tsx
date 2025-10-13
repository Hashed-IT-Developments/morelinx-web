import { Input as ShadCnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
    name?: string;
    icon?: React.ReactNode;
    icon_placement?: 'left' | 'right';
    label?: string;
    placeholder?: string;
    className?: string;
}

export default function Input({ name, label, placeholder, icon, icon_placement = 'left', className, ...rest }: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && <Label htmlFor={name}>{label}</Label>}
            <div className="relative flex items-center">
                {icon && icon_placement === 'left' && <span className="pointer-events-none absolute left-3 flex items-center">{icon}</span>}
                <ShadCnInput
                    name={name}
                    placeholder={placeholder}
                    className={cn(className, icon && icon_placement === 'left' && 'pl-8', icon && icon_placement === 'right' && 'pr-8')}
                    {...rest}
                />
                {icon && icon_placement === 'right' && <span className="pointer-events-none absolute right-3 flex items-center">{icon}</span>}
            </div>
        </div>
    );
}
