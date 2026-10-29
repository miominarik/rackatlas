import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="26" height="6.5" rx="1.75" />
            <rect
                x="3"
                y="12.75"
                width="26"
                height="6.5"
                rx="1.75"
                opacity="0.8"
            />
            <rect
                x="3"
                y="21.5"
                width="26"
                height="6.5"
                rx="1.75"
                opacity="0.6"
            />
            <circle cx="7.5" cy="7.25" r="1" fill="var(--logo-dot, #fff)" />
            <circle cx="7.5" cy="16" r="1" fill="var(--logo-dot, #fff)" />
            <circle cx="7.5" cy="24.75" r="1" fill="var(--logo-dot, #fff)" />
        </svg>
    );
}
