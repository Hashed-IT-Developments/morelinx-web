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

                    <DropdownMenuContent align="end" sideOffset={19} alignOffset={10} className="">
                        <DropdownMenuItem
                            className="flex h-[45px] cursor-pointer items-center gap-2 !rounded-none border-b px-4 py-3 hover:bg-gray-100"
                            onClick={onEdit}
                        >
                            <Pencil />
                            <span className="text-base font-medium">Edit</span>
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="flex h-[45px] cursor-pointer items-center gap-2 !rounded-none px-4 py-3 hover:bg-gray-100">
                                <Trash />
                                <span className="text-base font-medium">Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
            </AlertDialog>
        </>
    );
}
