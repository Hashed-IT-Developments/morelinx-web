import { type ClassValue, clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function getStatusColor(status: string) {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    const s = status.toLowerCase();
    if (s.includes('reject') || s.includes('disapprove')) {
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    }
    if (s.includes('for_approval')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }
    if (s.includes('for_inspection')) {
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    }
    if (s.includes('for_verification')) {
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
    }
    if (s.includes('for_processing')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }
    if (s.includes('in_process')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    if (s.includes('active') || s.includes('approved')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
}
