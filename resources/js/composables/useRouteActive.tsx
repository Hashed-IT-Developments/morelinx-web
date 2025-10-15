// composables/useRouteActive.ts
export function useRouteActive() {
    /**
     * Check if the given route or URL is active.
     * Works with both named routes (via Ziggy) and raw URL paths.
     */
    const isRouteActive = (currentUrl: string, targetHref: string, routeName?: string): boolean => {
        // Try to match via route name using Ziggy's route helper
        if (routeName && typeof window !== 'undefined' && 'route' in window) {
            const routeFunction = (
                window as unknown as {
                    route?: () => { current: () => string | null };
                }
            ).route;

            if (routeFunction) {
                try {
                    const currentRoute = routeFunction();
                    if (currentRoute) {
                        const currentRouteName = currentRoute.current();
                        if (currentRouteName === routeName || currentRouteName?.startsWith(`${routeName}.`)) {
                            return true;
                        }
                    }
                } catch {
                    // Fallback to URL-based matching
                }
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

    return { isRouteActive };
}
