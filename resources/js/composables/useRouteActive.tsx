// composables/useRouteActive.tsx
export function useRouteActive() {
    /**
     * Check if the given route or URL is active.
     * Works with both named routes (via Ziggy) and raw URL paths.
     */
    const isRouteActive = (currentUrl: string, targetHref: string, routeName?: string): boolean => {
        // Try to match via route name using Ziggy's route helper
        if (routeName && typeof window !== 'undefined' && 'route' in window && typeof route === 'function') {
            try {
                // Get current route name from Ziggy
                const currentRouteName = route().current();

                if (currentRouteName) {
                    // Exact match
                    if (currentRouteName === routeName) {
                        return true;
                    }

                    // Check if current route is a child of the target route
                    // e.g., applications.show should match applications.index
                    if (currentRouteName.startsWith(`${routeName}.`)) {
                        return true;
                    }

                    // Check if target route is a parent of current route
                    // e.g., if we're on applications.create and checking applications
                    const routeParts = routeName.split('.');
                    const currentParts = currentRouteName.split('.');

                    if (routeParts.length <= currentParts.length) {
                        const matches = routeParts.every((part, index) => part === currentParts[index]);
                        if (matches) {
                            return true;
                        }
                    }
                }

                // Also check if the generated URL matches
                try {
                    const generatedUrl = route(routeName);
                    if (generatedUrl && (currentUrl === generatedUrl || currentUrl.startsWith(generatedUrl + '/'))) {
                        return true;
                    }
                } catch {
                    // Route might not exist or have required parameters
                }
            } catch {
                // Fallback to URL-based matching if Ziggy fails
            }
        }

        // Normalize trailing slashes for URL comparison
        const normalizedUrl = currentUrl.replace(/\/$/, '') || '/';
        const normalizedHref = targetHref.replace(/\/$/, '') || '/';

        // Exact match for root
        if (normalizedHref === '/') {
            return normalizedUrl === '/';
        }

        // Match for subpaths
        return normalizedUrl === normalizedHref || normalizedUrl.startsWith(`${normalizedHref}/`);
    };

    /**
     * Check if any child items in a dropdown/collapsible menu are active
     */
    const hasActiveChild = (items: Array<{ href: string; routeName?: string }>, currentUrl: string): boolean => {
        return items.some((item) => isRouteActive(currentUrl, item.href, item.routeName));
    };

    return { isRouteActive, hasActiveChild };
}
