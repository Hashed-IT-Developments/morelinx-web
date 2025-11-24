import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(16, 16)">
                <circle cx="0" cy="-12" r="1.5" fill="#4A9B3A" />
                <circle cx="8.5" cy="-8.5" r="1.5" fill="#4A9B3A" />
                <circle cx="12" cy="0" r="1.5" fill="#4A9B3A" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#4A9B3A" />
                <circle cx="0" cy="12" r="1.5" fill="#4A9B3A" />
                <circle cx="-8.5" cy="8.5" r="1.5" fill="#4A9B3A" />
                <circle cx="-12" cy="0" r="1.5" fill="#4A9B3A" />
                <circle cx="-8.5" cy="-8.5" r="1.5" fill="#4A9B3A" />

                <circle cx="0" cy="-7" r="1" fill="#4A9B3A" />
                <circle cx="5" cy="-5" r="1" fill="#4A9B3A" />
                <circle cx="7" cy="0" r="1" fill="#4A9B3A" />
                <circle cx="5" cy="5" r="1" fill="#4A9B3A" />
                <circle cx="0" cy="7" r="1" fill="#4A9B3A" />
                <circle cx="-5" cy="5" r="1" fill="#4A9B3A" />
                <circle cx="-7" cy="0" r="1" fill="#4A9B3A" />
                <circle cx="-5" cy="-5" r="1" fill="#4A9B3A" />

                <circle cx="0" cy="-3" r="0.8" fill="#4A9B3A" />
                <circle cx="2.1" cy="-2.1" r="0.8" fill="#4A9B3A" />
                <circle cx="3" cy="0" r="0.8" fill="#4A9B3A" />
                <circle cx="2.1" cy="2.1" r="0.8" fill="#4A9B3A" />
                <circle cx="0" cy="3" r="0.8" fill="#4A9B3A" />
                <circle cx="-2.1" cy="2.1" r="0.8" fill="#4A9B3A" />
                <circle cx="-3" cy="0" r="0.8" fill="#4A9B3A" />
                <circle cx="-2.1" cy="-2.1" r="0.8" fill="#4A9B3A" />
            </g>
        </svg>
    );
}
