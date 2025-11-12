# Image Component Documentation

A high-performance image component with progressive loading, automatic optimization, and WebP support built on top of react-lazy-load-image-component.

## Features

- **Progressive Loading**: Shows low-resolution placeholder (20px) while high-resolution image loads
- **Automatic Optimization**: Server-side image processing with WebP conversion
- **Lazy Loading**: Images load only when they enter the viewport
- **Blur Effect**: Smooth transition from blurred placeholder to sharp image
- **Fallback Support**: Graceful handling of failed image loads
- **Format Support**: Works with PNG, JPG, SVG, and WebP images
- **Responsive**: Automatic width/height handling with object-fit controls

## Import

```tsx
import Image from '@/components/composables/image';
```

## Basic Usage

```tsx
<Image src="/path/to/image.jpg" alt="Description" />
```

## Props

| Prop             | Type                                                       | Default   | Description                           |
| ---------------- | ---------------------------------------------------------- | --------- | ------------------------------------- |
| `src`            | `string`                                                   | -         | **Required.** Image source path       |
| `alt`            | `string`                                                   | -         | **Required.** Alternative text        |
| `width`          | `number`                                                   | -         | Target width in pixels                |
| `height`         | `number`                                                   | -         | Target height in pixels               |
| `className`      | `string`                                                   | `''`      | Additional CSS classes                |
| `style`          | `React.CSSProperties`                                      | `{}`      | Inline styles                         |
| `objectFit`      | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | How image should be resized           |
| `objectPosition` | `string`                                                   | `center`  | Image position within container       |
| `enableWebP`     | `boolean`                                                  | `true`    | Enable WebP optimization              |
| `blurIntensity`  | `number`                                                   | `20`      | Blur intensity for loading state (px) |

## How It Works

### Progressive Loading Process

1. **Placeholder Generation**: Creates a 20px version with blur effect
2. **Simultaneous Loading**: Both placeholder and full-resolution images load in parallel
3. **Smart Display**: Shows placeholder first, then smoothly transitions to high-res
4. **Fallback Chain**: Original → Optimized → Placeholder if any step fails

### URL Generation

The component automatically generates optimized URLs:

```
Original:    /images/photo.jpg
Placeholder: /images/optimized?src=%2Fimages%2Fphoto.jpg&w=20&fm=webp
Optimized:   /images/optimized?src=%2Fimages%2Fphoto.jpg&w=800&fm=webp
```

## Examples

### Basic Image

```tsx
<Image src="/hero-image.jpg" alt="Hero banner" />
```

### Fixed Size Image

```tsx
<Image src="/profile-photo.jpg" alt="User profile" width={150} height={150} objectFit="cover" className="rounded-full" />
```

### Gallery Image with Custom Styling

```tsx
<Image
    src="/gallery/photo-1.jpg"
    alt="Gallery photo"
    width={400}
    height={300}
    objectFit="contain"
    objectPosition="top"
    style={{ borderRadius: '8px' }}
    className="shadow-lg"
/>
```

### Disable WebP Optimization

```tsx
<Image src="/logo.png" alt="Company logo" enableWebP={false} width={200} />
```

### Custom Blur Intensity

```tsx
<Image src="/background.jpg" alt="Background image" blurIntensity={30} objectFit="cover" className="absolute inset-0 -z-10" />
```

### Responsive Image

```tsx
<Image src="/responsive-banner.jpg" alt="Responsive banner" className="mx-auto w-full max-w-4xl" objectFit="cover" style={{ aspectRatio: '16/9' }} />
```

### Logo with Fallback

```tsx
<Image src="/company-logo.svg" alt="Company Logo" width={120} height={60} objectFit="contain" className="h-16 w-auto" />
```

## Advanced Usage

### Grid Layout

```tsx
<div className="grid grid-cols-3 gap-4">
    {images.map((img, index) => (
        <Image
            key={index}
            src={img.src}
            alt={img.alt}
            width={300}
            height={200}
            objectFit="cover"
            className="rounded-lg transition-transform hover:scale-105"
        />
    ))}
</div>
```

### Card Component

```tsx
<div className="overflow-hidden rounded-lg bg-white shadow-md">
    <Image src="/article-thumbnail.jpg" alt="Article thumbnail" width={400} height={250} objectFit="cover" className="w-full" />
    <div className="p-6">
        <h3>Article Title</h3>
        <p>Article content...</p>
    </div>
</div>
```

### Avatar Component

```tsx
<Image
    src={user.avatar || '/default-avatar.png'}
    alt={`${user.name}'s avatar`}
    width={48}
    height={48}
    objectFit="cover"
    className="rounded-full border-2 border-gray-300"
/>
```

## Performance Notes

### Image Optimization

- **WebP Format**: Automatically converts to WebP for ~30% smaller file sizes
- **Progressive Loading**: 20px placeholder loads instantly (typically <1KB)
- **Lazy Loading**: Images only load when entering viewport
- **Server Caching**: Optimized images are cached server-side

### Best Practices

1. **Always provide `alt` text** for accessibility
2. **Specify `width` when possible** for better optimization
3. **Use appropriate `objectFit`** for your layout needs
4. **Consider `blurIntensity`** based on image content
5. **Set explicit dimensions** to prevent layout shift

### File Size Examples

| Original | Optimized (WebP) | Placeholder | Savings |
| -------- | ---------------- | ----------- | ------- |
| 2.1MB    | 650KB            | 890B        | ~69%    |
| 856KB    | 245KB            | 672B        | ~71%    |
| 423KB    | 127KB            | 523B        | ~70%    |

## Backend Integration

The component works with the `ImageController` endpoint:

```php
Route::get('/images/optimized', [ImageController::class, 'optimize']);
```

### Supported Parameters

- `src`: Source image path (URL encoded)
- `w`: Target width in pixels
- `h`: Target height in pixels
- `fm`: Output format (`webp`, `jpg`, `png`)
- `q`: Quality (1-100, ignored for PNG)

### Example API Calls

```
GET /images/optimized?src=/photo.jpg&w=800&fm=webp
GET /images/optimized?src=/logo.png&w=200
GET /images/optimized?src=/banner.jpg&w=1200&h=400&fm=webp&q=85
```

## Accessibility

- **Alt Text**: Always required for screen readers
- **Progressive Enhancement**: Works without JavaScript (shows original image)
- **Keyboard Navigation**: Follows standard image accessibility patterns
- **High Contrast**: Blur transitions work well with accessibility modes

## Browser Support

- **Modern Browsers**: Full WebP and lazy loading support
- **Legacy Browsers**: Graceful fallback to original images
- **Mobile**: Optimized for mobile performance and data usage

## Troubleshooting

### Image Not Loading

- Check if the source path is correct
- Verify ImageController is properly configured
- Check browser console for 404 errors

### WebP Not Working

- Ensure `enableWebP={true}` (default)
- Check if server supports WebP conversion
- Verify GD or ImageMagick is installed

### Slow Loading

- Consider reducing `width` for optimization
- Check if original images are too large
- Verify server caching is enabled

### Layout Shift

- Always specify `width` and `height` when possible
- Use CSS `aspect-ratio` for responsive images
- Consider using skeleton loading states
