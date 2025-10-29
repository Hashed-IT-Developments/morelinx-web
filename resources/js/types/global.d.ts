import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { route as ziggyRoute } from 'ziggy-js';

declare global {
    const route: typeof ziggyRoute;
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}
