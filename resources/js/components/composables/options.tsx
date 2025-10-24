'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Pencil, Trash } from 'lucide-react';

interface RowDropdownProps {
    onEdit: () => void;
    onDelete: () => void;
    children: React.ReactNode;
    className?: string;
}

export default function Options({ onEdit, onDelete, children, className }: RowDropdownProps) {
    return (
        <>
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the data and remove it from the collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete();
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild className={className}>
                        {children}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="p-0">
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 rounded-t rounded-b-none border-b px-4 py-3 hover:bg-gray-100"
                            onClick={onEdit}
                        >
                            <Pencil size={12} className="text-yellow-500" />
                            <span className="text-xs font-medium text-gray-900">Edit</span>
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-t-none rounded-b px-4 py-3 hover:bg-gray-100">
                                <Trash size={12} className="text-red-500" />
                                <span className="text-xs font-medium text-gray-900">Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
            </AlertDialog>
        </>
    );
}
