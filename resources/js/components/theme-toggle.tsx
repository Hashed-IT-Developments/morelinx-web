'use client';

import { Button } from '@/components/ui/button'; // adjust path if needed
import { Lightbulb, LightbulbOff } from 'lucide-react';
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
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer rounded-full">
            {theme === 'dark' ? <Lightbulb className="h-5 w-5" /> : <LightbulbOff className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
