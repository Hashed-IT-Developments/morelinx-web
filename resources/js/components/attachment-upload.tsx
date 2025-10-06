import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface AttachmentUploadProps {
    name: string; // e.g., "attachments.sss_id"
    label: string; // e.g., "SSS ID"
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ name, label }) => {
    const { setValue, watch } = useFormContext();
    const file = watch(name);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setValue(name, e.target.files[0]); // Store single file in form
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Label className={`text-sm font-medium ${file ? 'text-green-600' : ''}`}>{label}</Label>
            <input type="file" id={name} className="hidden" onChange={handleFileChange} />
            <Button
                variant="outline"
                type="button"
                onClick={() => document.getElementById(name)?.click()}
                className={`flex w-fit items-center gap-2 ${file ? 'text-green-600' : 'text-gray-600'}`}
            >
                <Upload className="h-4 w-4" />
                {file && file.name ? file.name : label}
            </Button>
        </div>
    );
};

export default AttachmentUpload;
