import Input from '@/components/composables/input';
import { Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
}

export default function SearchBar({ search, onSearchChange, onSearchSubmit, onSearchClear }: SearchBarProps) {
    return (
        <div className="mb-2">
            <form onSubmit={onSearchSubmit}>
                <div className="relative w-full">
                    <Input
                        type="text"
                        placeholder="Search Acnt. Number / Acnt. Name / Meter No. . . ."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-12 pr-12 pl-12 text-base font-semibold"
                    />
                    <Search className="absolute top-3 left-4 h-5 w-5 text-green-900" />
                    {search && (
                        <button
                            type="button"
                            className="absolute top-3 right-12 flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600"
                            onClick={onSearchClear}
                            aria-label="Clear search"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                <path
                                    fillRule="evenodd"
                                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded bg-green-900 text-white transition hover:bg-green-700"
                        aria-label="Search"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
