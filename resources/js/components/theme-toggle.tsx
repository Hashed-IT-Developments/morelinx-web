import { Button } from '@/components/ui/button'; // adjust path if needed
import { Lightbulb, LightbulbOff } from 'lucide-react';
import * as React from 'react';

export function ThemeToggle() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    // Load theme from localStorage on mount
    React.useEffect(() => {
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);
    }, []);

    // Apply theme whenever it changes
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <Button
            type="button" // ✅ prevents accidental form submit that causes redirect
            variant="outline"
            size="icon"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className="cursor-pointer rounded-full"
        >
            {theme === 'dark' ? <Lightbulb className="h-5 w-5" /> : <LightbulbOff className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
