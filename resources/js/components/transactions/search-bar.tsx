import Input from '@/components/composables/input';
import { Button } from '@/components/ui/button';
import { ClipboardList, ListOrdered, Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onSearchClear: () => void;
    onOpenQueue: () => void;
    onOpenSeriesSwitcher: () => void;
}

export default function SearchBar({ search, onSearchChange, onSearchSubmit, onSearchClear, onOpenQueue, onOpenSeriesSwitcher }: SearchBarProps) {
    return (
        <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <form onSubmit={onSearchSubmit} className="w-96">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search by Account Number, Account Name, or Meter No..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-12 pr-12 pl-12 text-base font-semibold"
                        />
                        <Search className="absolute top-3 left-4 h-5 w-5 text-green-900 dark:text-green-400" />
                        {search && (
                            <button
                                type="button"
                                className="absolute top-3 right-12 flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
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
                            className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded bg-green-900 text-white transition hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>
                <Button variant="default" className="h-12" onClick={onOpenQueue}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Payment Queue
                </Button>
            </div>
            <Button variant="outline" className="h-12" onClick={onOpenSeriesSwitcher}>
                <ListOrdered className="mr-2 h-4 w-4" />
                Transaction Series
            </Button>
        </div>
    );
}
