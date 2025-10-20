/**
 * Constants for the AttachmentFiles component
 */

// Grid layout configurations
export const GRID_BREAKPOINTS = {
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-3', 
    lg: 'lg:grid-cols-4',
    xl: 'xl:grid-cols-5'
} as const;

// Animation durations
export const ANIMATION_DURATION = {
    card_hover: 'duration-300',
    transition: 'transition-all'
} as const;

// Dialog sizes
export const DIALOG_SIZES = {
    preview: 'max-w-4xl',
    height: 'max-h-[90vh]',
    preview_content: 'min-h-[400px]',
    iframe_height: 'h-[600px]'
} as const;

// Icon sizes
export const ICON_SIZES = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4', 
    large: 'h-5 w-5',
    extra_large: 'h-6 w-6',
    empty_state: 'w-10 h-10',
    empty_state_container: 'w-20 h-20',
    preview_large: 'h-16 w-16'
} as const;

// Color classes for consistency
export const COLOR_CLASSES = {
    blue_gradient: 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-700',
    card_gradient: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-800 dark:to-gray-700',
    empty_state_gradient: 'bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900',
    empty_state_icon_bg: 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800'
} as const;