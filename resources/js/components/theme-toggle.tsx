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
            className="cursor-pointer rounded-full border-border/50 hover:border-border hover:bg-accent/80 dark:border-border/30 dark:hover:border-border/60 dark:hover:bg-accent/40"
        >
            {theme === 'dark' ? (
                <LightbulbOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
            ) : (
                <Lightbulb className="h-5 w-5 text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
