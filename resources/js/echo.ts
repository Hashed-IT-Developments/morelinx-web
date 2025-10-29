import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY as string,
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            console.log('Authorizer called for channel', channel.name);
            axios
                .post(
                    '/broadcasting/auth',
                    { socket_id: socketId, channel_name: channel.name },
                    {
                        withCredentials: true,
                    },
                )
                .then((response) => {
                    console.log('Authorization response:', response.data);
                    callback(null, response.data);
                })
                .catch((error) => {
                    console.error('Authorization failed', error);
                    callback(error instanceof Error ? error : new Error('Authorization failed'), null);
                });
        },
    }),
    wsHost: import.meta.env.VITE_REVERB_HOST as string,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

const conn = window.Echo.connector.pusher.connection;

conn.bind('state_change', (states: unknown) => console.log('State changed:', states));
conn.bind('connected', () => console.log('Connected!'));
conn.bind('disconnected', () => console.log('Disconnected!'));
conn.bind('error', (err: unknown) => console.log('Socket error:', err));

export default window.Echo;
