/**
 * Status utility composable for formatting and styling status values
 * Provides consistent status handling across the application
 *
 * This composable consolidates status-related functionality that was previously
 * scattered across multiple files (utils.ts, various components).
 *
 * Color scheme logic:
 * - Red: Rejected/Disapproved statuses
 * - Yellow: Application inspection statuses
 * - Orange: Verification statuses
 * - Blue: Approval, processing, and monitoring inspection statuses
 * - Green: Active/Approved statuses
 * - Gray: Default/Unknown statuses
 */

/**
 * Converts status string to human-readable label
 * Replaces underscores with spaces and capitalizes words
 * @param status - The status string to format
 * @returns Formatted status label
 */
export const getStatusLabel = (status: string): string => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
};

/**
 * Returns appropriate CSS classes for status styling
 * Provides consistent color coding for different status types
 * @param status - The status string to style
 * @returns CSS class string for badge styling
 */
export const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';

    const s = status.toLowerCase();

    // Rejection/Disapproval statuses - Red
    if (s.includes('reject') || s.includes('disapprove')) {
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    }

    // General approval statuses - Blue
    if (s.includes('for_approval')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Inspector approval statuses - Blue
    if (s.includes('for_inspector_approval')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Inspection statuses - Yellow for general applications, Blue for monitoring
    if (s.includes('for_inspection')) {
        // Use yellow for application workflow, blue for monitoring workflow
        return s.includes('inspector')
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    }

    // Verification statuses - Orange for applications, Blue for monitoring
    if (s.includes('verification') || s.includes('for_verification') || s.includes('verified')) {
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
    }

    // Processing statuses - Blue
    if (s.includes('process') || s.includes('for_processing') || s.includes('in_process')) {
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }

    // Active/Approved statuses - Green
    if (s.includes('active') || s.includes('approved')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }

    // Default - Gray
    return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
};

/**
 * Status variant mapping for different UI components
 * Maps status types to semantic variants
 * @param status - The status string
 * @returns Status variant string
 */
export const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (!status) return 'outline';

    const s = status.toLowerCase();

    if (s.includes('reject') || s.includes('disapprove')) {
        return 'destructive';
    }

    if (s.includes('active') || s.includes('approved')) {
        return 'default';
    }

    return 'outline';
};

/**
 * Checks if a status is considered "active" or "positive"
 * @param status - The status string to check
 * @returns Boolean indicating if status is active/positive
 */
export const isActiveStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('active') || s.includes('approved') || s.includes('completed');
};

/**
 * Checks if a status is considered "pending" or "in-progress"
 * @param status - The status string to check
 * @returns Boolean indicating if status is pending/in-progress
 */
export const isPendingStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('pending') || s.includes('for_') || s.includes('in_process') || s.includes('process');
};

/**
 * Checks if a status is considered "rejected" or "negative"
 * @param status - The status string to check
 * @returns Boolean indicating if status is rejected/negative
 */
export const isRejectedStatus = (status: string): boolean => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('reject') || s.includes('disapprove') || s.includes('cancelled') || s.includes('denied');
};

/**
 * Hook for status utilities
 * Provides all status-related functions in a single hook
 * @returns Object containing status utility functions
 */
export const useStatusUtils = () => {
    return {
        getStatusLabel,
        getStatusColor,
        getStatusVariant,
        isActiveStatus,
        isPendingStatus,
        isRejectedStatus,
    };
};
