'use client';

import { Button } from '@/components/ui/button'; // adjust path if needed
import { Moon, Sun } from 'lucide-react';
import * as React from 'react';

export function ThemeToggle() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
