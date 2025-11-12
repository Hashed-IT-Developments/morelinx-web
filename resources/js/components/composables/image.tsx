import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    enableWebP?: boolean;
    blurIntensity?: number;
}

const Image: React.FC<ImageProps> = ({
    src,
    alt = '',
    width,
    height,
    className = '',
    style = {},
    objectFit = 'cover',
    objectPosition = 'center',
    enableWebP = true,
    blurIntensity = 20,
}) => {
    const [_loaded, setLoaded] = useState(false);
    const [highResLoaded, setHighResLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState('');
    const [placeholderLoaded, setPlaceholderLoaded] = useState(false);

    const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

    const placeholderSrc = `/images/optimized?src=${encodeURIComponent(normalizedSrc)}&w=20${enableWebP ? '&fm=webp' : ''}`;

    const optimizedSrc = `/images/optimized?src=${encodeURIComponent(normalizedSrc)}${width ? `&w=${width}` : ''}${enableWebP ? '&fm=webp' : ''}`;

    const imgStyle: React.CSSProperties = {
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        objectFit,
        objectPosition,
        display: 'block',
        transition: 'filter 0.4s ease, opacity 0.4s ease',
        filter: !placeholderLoaded || !highResLoaded ? `blur(${blurIntensity}px)` : 'none',
        opacity: highResLoaded ? 1 : placeholderLoaded ? 0.8 : 0.3,
        ...style,
    };

    useEffect(() => {
        setLoaded(false);
        setHighResLoaded(false);
        setPlaceholderLoaded(false);

        setCurrentSrc(placeholderSrc);

        const placeholderImage: HTMLImageElement = new window.Image();
        const highResImage: HTMLImageElement = new window.Image();

        placeholderImage.src = placeholderSrc;
        highResImage.src = optimizedSrc;

        placeholderImage.onload = () => {
            setPlaceholderLoaded(true);
        };

        highResImage.onload = () => {
            setCurrentSrc(optimizedSrc);
            setHighResLoaded(true);
        };

        placeholderImage.onerror = () => {
            setPlaceholderLoaded(true);
        };

        highResImage.onerror = () => {
            const fallbackImage: HTMLImageElement = new window.Image();
            fallbackImage.src = normalizedSrc;

            fallbackImage.onload = () => {
                setCurrentSrc(normalizedSrc);
                setHighResLoaded(true);
            };

            fallbackImage.onerror = () => {
                setHighResLoaded(true);
            };
        };
    }, [optimizedSrc, placeholderSrc, normalizedSrc]);

    return (
        <LazyLoadImage
            src={currentSrc}
            alt={alt}
            effect="blur"
            afterLoad={() => setLoaded(true)}
            style={imgStyle}
            className={className}
            placeholder={
                <div
                    style={{
                        ...imgStyle,
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: `blur(${blurIntensity}px)`,
                    }}
                />
            }
        />
    );
};

export default Image;
