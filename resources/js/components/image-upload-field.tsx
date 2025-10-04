// components/form/ImageUploadField.tsx

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import React from 'react';
import { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface ImageUploadFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    rules?: RegisterOptions<T, Path<T>>;
    defaultImage?: string;
    width?: string;
    height?: string;
}

export function ImageUploadField<T extends FieldValues>({
    control,
    name,
    label,
    rules,
    defaultImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png',
    width = '400px',
    height = '400px',
}: ImageUploadFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            rules={rules}
            render={({ field }) => {
                // Preview image URL
                let imageUrl: string | undefined;
                if (field.value && field.value.length > 0) {
                    imageUrl = URL.createObjectURL(field.value[0]);
                }

                // Drag and drop handlers
                const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        field.onChange(e.dataTransfer.files);
                    }
                };

                const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                };

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormMessage />
                        <div
                            className="relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded border bg-muted object-cover"
                            style={{ width, height }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <img
                                src={imageUrl || defaultImage}
                                alt="Preview"
                                className="pointer-events-none absolute inset-0 h-full w-full rounded object-cover"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                style={{ zIndex: 2 }}
                            />
                            <span className="pointer-events-none absolute right-0 bottom-2 left-0 z-10 text-center text-sm text-muted-foreground">
                                Drag & drop or click to select image
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-muted-foreground">
                                {field.value && field.value.length > 0 ? `Selected file: ${field.value[0].name}` : 'No image selected'}
                            </span>
                        </div>
                    </FormItem>
                );
            }}
        />
    );
}
