import AttachmentUpload from '@/components/attachment-upload';

export default function StepGovernmentInfo() {
    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="mb-4 text-lg font-semibold">Attachment Info</h2>
                <div className="mt-6 mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="col-span-3 flex">
                        <div className="flex items-center rounded-l-md bg-red-600 px-3 py-2">
                            <span className="font-bold text-white">Note:</span>
                        </div>
                        <div className="flex flex-1 items-center rounded-r-md bg-red-100 px-3 py-2">
                            <span className="text-sm text-red-700">EWT/FT Tagging requires attached documents</span>
                        </div>
                    </div>
                    <AttachmentUpload key="cg_ewt_tag" name={`cg_ewt_tag`} label="Expanded Withholding Tax" />
                    <AttachmentUpload key="cg_ft_tag" name={`cg_ft_tag`} label="Final Tax" />
                </div>
            </div>
        </div>
    );
}
