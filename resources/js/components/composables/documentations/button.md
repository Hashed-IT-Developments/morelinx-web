# Button Component Documentation

A customizable button component built on top of ShadCN UI with additional features for shapes, modes, and styling.

## Import

```tsx
import Button from '@/components/composables/button';
```

## Basic Usage

```tsx
<Button>Click me</Button>
```

## Props

| Prop        | Type                                                                          | Default     | Description            |
| ----------- | ----------------------------------------------------------------------------- | ----------- | ---------------------- |
| `id`        | `string`                                                                      | -           | HTML id attribute      |
| `name`      | `string`                                                                      | -           | HTML name attribute    |
| `type`      | `'button' \| 'submit' \| 'reset'`                                             | `'submit'`  | Button type            |
| `variant`   | `'default' \| 'link' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost'` | `'default'` | Button style variant   |
| `size`      | `'default' \| 'sm' \| 'lg' \| 'icon'`                                         | `'default'` | Button size            |
| `shape`     | `'circle' \| 'rounded' \| 'square' \| string`                                 | -           | Button shape override  |
| `mode`      | `'success' \| 'danger' \| 'warning' \| 'info'`                                | -           | Color mode theme       |
| `className` | `string`                                                                      | -           | Additional CSS classes |
| `children`  | `ReactNode`                                                                   | -           | Button content         |

All standard HTML button attributes are also supported via `...rest`.

## Examples

### Basic Variants

```tsx
// Default button
<Button>Default</Button>

// Different variants
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🏠</Button>
```

### Shapes

```tsx
<Button shape="square">Square</Button>
<Button shape="rounded">Rounded</Button>
<Button shape="circle" size="icon">○</Button>
```

### Color Modes

The `mode` prop applies semantic color schemes that work with all variants:

#### Success Mode

```tsx
<Button mode="success">Success Default</Button>
<Button mode="success" variant="outline">Success Outline</Button>
<Button mode="success" variant="ghost">Success Ghost</Button>
<Button mode="success" variant="secondary">Success Secondary</Button>
<Button mode="success" variant="link">Success Link</Button>
<Button mode="success" variant="destructive">Success Destructive</Button>
```

#### Danger Mode

```tsx
<Button mode="danger">Danger Default</Button>
<Button mode="danger" variant="outline">Danger Outline</Button>
<Button mode="danger" variant="ghost">Danger Ghost</Button>
<Button mode="danger" variant="secondary">Danger Secondary</Button>
<Button mode="danger" variant="link">Danger Link</Button>
<Button mode="danger" variant="destructive">Danger Destructive</Button>
```

#### Warning Mode

```tsx
<Button mode="warning">Warning Default</Button>
<Button mode="warning" variant="outline">Warning Outline</Button>
<Button mode="warning" variant="ghost">Warning Ghost</Button>
<Button mode="warning" variant="secondary">Warning Secondary</Button>
<Button mode="warning" variant="link">Warning Link</Button>
<Button mode="warning" variant="destructive">Warning Destructive</Button>
```

#### Info Mode

```tsx
<Button mode="info">Info Default</Button>
<Button mode="info" variant="outline">Info Outline</Button>
<Button mode="info" variant="ghost">Info Ghost</Button>
<Button mode="info" variant="secondary">Info Secondary</Button>
<Button mode="info" variant="link">Info Link</Button>
<Button mode="info" variant="destructive">Info Destructive</Button>
```

### Combined Examples

```tsx
// Large success button with rounded shape
<Button
  mode="success"
  size="lg"
  shape="rounded"
>
  Save Changes
</Button>

// Small danger outline button
<Button
  mode="danger"
  variant="outline"
  size="sm"
>
  Delete
</Button>

// Circular icon button
<Button
  shape="circle"
  size="icon"
  variant="ghost"
>
  ×
</Button>

// Square warning button
<Button
  mode="warning"
  shape="square"
  variant="secondary"
>
  Alert
</Button>
```

### Form Usage

```tsx
// Submit button (default type)
<Button mode="success">Submit Form</Button>

// Cancel button
<Button
  type="button"
  variant="outline"
  onClick={() => handleCancel()}
>
  Cancel
</Button>

// Reset button
<Button
  type="reset"
  mode="warning"
  variant="secondary"
>
  Reset Form
</Button>
```

### Event Handling

```tsx
<Button
    onClick={(e) => {
        console.log('Button clicked!', e);
    }}
    onMouseEnter={() => console.log('Hover start')}
    onMouseLeave={() => console.log('Hover end')}
>
    Interactive Button
</Button>
```

### Disabled State

```tsx
<Button disabled>Disabled Button</Button>
<Button disabled mode="success">Disabled Success</Button>
<Button disabled mode="danger" variant="outline">Disabled Danger</Button>
```

### Loading State

```tsx
<Button disabled>
  <span className="animate-spin mr-2">⟳</span>
  Loading...
</Button>

// With icon
<Button disabled mode="info">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Processing...
</Button>
```

## CSS Variables

The component uses CSS custom properties for color modes. Make sure these are defined in your CSS:

```css
:root {
    /* Success Colors */
    --color-success: #22c55e;
    --color-success-foreground: #ffffff;
    --color-success-primary: #16a34a;

    /* Danger Colors */
    --color-danger: #ef4444;
    --color-danger-foreground: #ffffff;
    --color-danger-primary: #dc2626;

    /* Warning Colors */
    --color-warning: #f59e0b;
    --color-warning-foreground: #ffffff;
    --color-warning-primary: #d97706;

    /* Info Colors */
    --color-info: #3b82f6;
    --color-info-foreground: #ffffff;
    --color-info-primary: #2563eb;
}
```

## Mode + Variant Combinations

Each mode works with all variants. Here's how they combine:

| Mode      | Variant       | Description                   |
| --------- | ------------- | ----------------------------- |
| `success` | `default`     | Solid green button            |
| `success` | `outline`     | Green border with green text  |
| `success` | `ghost`       | Transparent with green text   |
| `success` | `secondary`   | Light green background        |
| `success` | `link`        | Green text link style         |
| `success` | `destructive` | Solid green (same as default) |

The same pattern applies to `danger`, `warning`, and `info` modes.

## Accessibility

The component maintains all accessibility features from the underlying ShadCN button:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management

```tsx
<Button
  aria-label="Save document"
  aria-describedby="save-help-text"
>
  Save
</Button>

<Button
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Accessible Button
</Button>
```

## Best Practices

### 1. Use Semantic Modes

```tsx
// ✅ Good - semantic meaning
<Button mode="success">Save</Button>
<Button mode="danger">Delete</Button>
<Button mode="warning">Caution</Button>
<Button mode="info">Learn More</Button>

// ❌ Avoid - no semantic meaning
<Button className="bg-green-500">Save</Button>
```

### 2. Combine Props Meaningfully

```tsx
// ✅ Good - logical combination
<Button mode="danger" variant="outline" size="sm">
  Remove Item
</Button>

// ✅ Good - clear intent
<Button mode="success" variant="ghost" shape="circle" size="icon">
  ✓
</Button>

// ❌ Confusing - conflicting semantics
<Button mode="success" variant="destructive">
  Save
</Button>
```

### 3. Use Appropriate Types

```tsx
// ✅ Good - explicit types
<Button type="submit" mode="success">Submit</Button>
<Button type="button" onClick={handleCancel}>Cancel</Button>
<Button type="reset" mode="warning">Reset</Button>

// ✅ Good - form context
<form onSubmit={handleSubmit}>
  <Button>Submit</Button> {/* type="submit" by default */}
  <Button type="button" onClick={handleCancel}>Cancel</Button>
</form>
```

### 4. Shape Guidelines

```tsx
// ✅ Good - appropriate shapes
<Button shape="circle" size="icon">×</Button>
<Button shape="rounded" size="lg">Get Started</Button>
<Button shape="square">Grid View</Button>

// ❌ Avoid - poor combinations
<Button shape="circle" size="lg">Very Long Text</Button>
```

## Common Patterns

### Action Buttons

```tsx
<div className="flex gap-2">
  <Button mode="success">Save</Button>
  <Button variant="outline" type="button">Cancel</Button>
</div>

<div className="flex gap-2 justify-end">
  <Button variant="ghost" type="button">Cancel</Button>
  <Button mode="danger" variant="outline">Delete</Button>
  <Button mode="success">Confirm</Button>
</div>
```

### Icon Buttons

```tsx
<Button size="icon" variant="ghost" shape="circle">
  <PlusIcon className="h-4 w-4" />
</Button>

<Button size="icon" variant="outline" shape="square">
  <SettingsIcon className="h-4 w-4" />
</Button>

<Button mode="danger" size="icon" variant="ghost">
  <TrashIcon className="h-4 w-4" />
</Button>
```

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

<Button disabled={isLoading} mode="success">
    {isLoading ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
        </>
    ) : (
        'Save Changes'
    )}
</Button>;
```

### Confirmation Patterns

```tsx
// Simple confirmation
<Button
    mode="danger"
    onClick={() => {
        if (confirm('Are you sure you want to delete this item?')) {
            handleDelete();
        }
    }}
>
    Delete Item
</Button>;

// State-based confirmation
const [showConfirm, setShowConfirm] = useState(false);

{
    showConfirm ? (
        <div className="flex gap-2">
            <Button mode="danger" size="sm" onClick={handleConfirmDelete}>
                Confirm Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
            </Button>
        </div>
    ) : (
        <Button mode="danger" variant="outline" onClick={() => setShowConfirm(true)}>
            Delete
        </Button>
    );
}
```

### Navigation Buttons

```tsx
<Button variant="link" asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

<Button variant="ghost" onClick={() => router.back()}>
  ← Back
</Button>

<Button mode="info" onClick={() => router.push('/help')}>
  Need Help?
</Button>
```

## Custom Styling

You can extend the component with custom CSS classes:

```tsx
<Button
  className="shadow-lg transform hover:scale-105 transition-transform"
  mode="success"
>
  Animated Button
</Button>

<Button
  className="w-full justify-start"
  variant="ghost"
>
  <Icon className="mr-2" />
  Full Width Button
</Button>
```

## TypeScript Integration

The component is fully typed and supports TypeScript:

```tsx
import { ComponentProps } from 'react';

interface CustomButtonProps extends ComponentProps<typeof Button> {
    isSpecial?: boolean;
}

function CustomButton({ isSpecial, ...props }: CustomButtonProps) {
    return <Button {...props} mode={isSpecial ? 'success' : props.mode} className={cn(props.className, isSpecial && 'ring-2 ring-yellow-400')} />;
}
```
