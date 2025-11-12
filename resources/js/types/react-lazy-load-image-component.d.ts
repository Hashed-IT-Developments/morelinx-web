declare module 'react-lazy-load-image-component' {
    import { ComponentType, ImgHTMLAttributes } from 'react';

    export interface LazyLoadImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
        src: string;
        alt?: string;
        placeholder?: React.ReactNode;
        beforeLoad?: () => void;
        afterLoad?: () => void;
        onError?: () => void;
        height?: number | string;
        width?: number | string;
        threshold?: number;
        effect?: 'blur' | 'black-and-white' | 'opacity';
        wrapperClassName?: string;
        wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
        delayMethod?: 'throttle' | 'debounce';
        delayTime?: number;
        scrollPosition?: {
            x: number;
            y: number;
        };
        useIntersectionObserver?: boolean;
        useSuspense?: boolean;
    }

    export const LazyLoadImage: ComponentType<LazyLoadImageProps>;

    export interface LazyLoadComponentProps {
        children: React.ReactNode;
        placeholder?: React.ReactNode;
        threshold?: number;
        scrollPosition?: {
            x: number;
            y: number;
        };
        useIntersectionObserver?: boolean;
    }

    export const LazyLoadComponent: ComponentType<LazyLoadComponentProps>;

    export function trackWindowScroll<P>(BaseComponent: ComponentType<P>): ComponentType<P & { scrollPosition?: { x: number; y: number } }>;
}

declare module 'react-lazy-load-image-component/src/effects/blur.css';
declare module 'react-lazy-load-image-component/src/effects/black-and-white.css';
declare module 'react-lazy-load-image-component/src/effects/opacity.css';
