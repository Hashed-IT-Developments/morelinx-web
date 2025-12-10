import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

export default function ApplicantPhotoCapture() {
    const form = useFormContext();

    // Camera capture states
    const [showCamera, setShowCamera] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    /**
     * Attach stream to video when activated
     */
    useEffect(() => {
        if (showCamera && isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(console.error);
        }
    }, [showCamera, isCameraActive]);

    /**
     * Start camera for photo capture
     */
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 },
            });

            streamRef.current = stream;

            setIsCameraActive(true);
            setShowCamera(true);
        } catch (error) {
            toast.error('Camera access denied', {
                description: 'Please allow camera access to capture photo',
            });
            console.error('Error accessing camera:', error);
        }
    };

    /**
     * Stop camera stream
     */
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
        setShowCamera(false);
    };

    /**
     * Capture photo from video stream
     */
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], `applicant-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                            form.setValue('applicant_photo', file, { shouldValidate: true });
                            setCapturedPhoto(canvas.toDataURL('image/jpeg'));
                            stopCamera();

                            toast.success('Photo captured successfully', {
                                description: 'Applicant photo has been saved',
                            });
                        }
                    },
                    'image/jpeg',
                    0.95,
                );
            }
        }
    };

    /**
     * Remove captured photo
     */
    const removePhoto = () => {
        setCapturedPhoto(null);
        form.setValue('applicant_photo', null, { shouldValidate: true });
        toast.info('Photo removed');
    };

    /**
     * Cleanup camera on unmount
     */
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Applicant Photo</h2>

            {/* Camera View */}
            {showCamera && isCameraActive && (
                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-lg" />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={stopCamera}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={capturePhoto}>
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Photo
                        </Button>
                    </div>
                </div>
            )}

            {/* Photo Preview and Controls */}
            {!showCamera && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Preview Section */}
                    <div className="rounded-lg border p-4">
                        {capturedPhoto ? (
                            <img src={capturedPhoto} alt="Applicant" className="w-full rounded-lg" />
                        ) : (
                            <div className="flex aspect-[1/1] items-center justify-center rounded-lg bg-muted">
                                <div className="text-center text-muted-foreground">
                                    <Camera className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                    <p className="text-sm">No photo captured</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls Section */}
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Instructions</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Ensure good lighting</li>
                                <li>• Face the camera directly</li>
                                <li>• Remove any headwear or accessories</li>
                                <li>• Keep a neutral expression</li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-2">
                            {!capturedPhoto ? (
                                <Button type="button" onClick={startCamera} className="w-full">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Open Camera
                                </Button>
                            ) : (
                                <>
                                    <Button type="button" variant="outline" onClick={startCamera} className="w-full">
                                        <Camera className="mr-2 h-4 w-4" />
                                        Retake Photo
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={removePhoto} className="w-full">
                                        <X className="mr-2 h-4 w-4" />
                                        Remove Photo
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
