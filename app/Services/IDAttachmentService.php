<?php

namespace App\Services;

use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Exception;

class IDAttachmentService
{
    /**
     * Store an ID attachment with thumbnail generation
     *
     * @param UploadedFile $file
     * @param CustomerApplication $customerApplication
     * @param string $idType
     * @return CaAttachment
     * @throws Exception
     */
    public function storeIDAttachment(
        UploadedFile $file,
        CustomerApplication $customerApplication,
        string $idType
    ): CaAttachment {
        DB::beginTransaction();
        
        try {
            // Validate file
            $this->validateFile($file);
            
            // Generate unique filename
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;
            
            // Get storage path from config
            $storagePath = config('filesystems.paths.attachments.ids', 'attachments/ids');
            
            // Store original file
            $originalPath = $file->storeAs($storagePath, $uniqueName, 'public');
            
            if (!$originalPath) {
                throw new Exception("Failed to store file: {$file->getClientOriginalName()}");
            }
            
            Log::info('ID attachment uploaded', [
                'customer_application_id' => $customerApplication->id,
                'id_type' => $idType,
                'file_name' => $uniqueName,
                'file_size' => $file->getSize(),
                'path' => $originalPath
            ]);
            
            // Generate thumbnail for image files
            if ($this->isImage($extension)) {
                $this->generateThumbnail($file, $originalPath);
            }
            
            // Create database record
            $attachment = CaAttachment::create([
                'customer_application_id' => $customerApplication->id,
                'type' => $idType,
                'path' => $originalPath,
            ]);
            
            DB::commit();
            
            return $attachment;
            
        } catch (Exception $e) {
            DB::rollBack();
            
            // Clean up uploaded file if it exists
            if (isset($originalPath) && Storage::disk('public')->exists($originalPath)) {
                Storage::disk('public')->delete($originalPath);
            }
            
            Log::error('Failed to store ID attachment', [
                'customer_application_id' => $customerApplication->id,
                'id_type' => $idType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Validate uploaded file
     *
     * @param UploadedFile $file
     * @return void
     * @throws Exception
     */
    private function validateFile(UploadedFile $file): void
    {
        // Check if file is valid
        if (!$file->isValid()) {
            throw new Exception('Invalid file upload');
        }
        
        // Validate mime type
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new Exception('Invalid file type. Only images, PDFs, and documents (doc, docx) are allowed.');
        }
        
        // Validate file size (5MB max)
        $maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if ($file->getSize() > $maxSize) {
            throw new Exception('File size exceeds 5MB limit.');
        }
    }
    
    /**
     * Check if file is an image
     *
     * @param string $extension
     * @return bool
     */
    private function isImage(string $extension): bool
    {
        return in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);
    }
    
    /**
     * Generate thumbnail for image
     *
     * @param UploadedFile $file
     * @param string $originalPath
     * @return void
     */
    private function generateThumbnail(UploadedFile $file, string $originalPath): void
    {
        try {
            $thumbnailWidth = config('filesystems.paths.thumbnails.width', 800);
            $thumbnailPrefix = config('filesystems.paths.thumbnails.prefix', 'thumb_');
            
            $thumbnailPath = dirname($originalPath) . '/' . $thumbnailPrefix . basename($originalPath);
            
            Storage::disk('public')->put(
                $thumbnailPath,
                Image::read($file)->scaleDown(width: $thumbnailWidth)->encode()
            );
            
            Log::info('Thumbnail generated', [
                'original_path' => $originalPath,
                'thumbnail_path' => $thumbnailPath
            ]);
            
        } catch (Exception $e) {
            // Log but don't fail - thumbnail generation is not critical
            Log::warning('Failed to generate thumbnail', [
                'path' => $originalPath,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Store multiple ID attachments
     *
     * @param array $files Array of ['file' => UploadedFile, 'type' => string]
     * @param CustomerApplication $customerApplication
     * @return array Array of CaAttachment models
     * @throws Exception
     */
    public function storeMultipleIDAttachments(
        array $files,
        CustomerApplication $customerApplication
    ): array {
        $attachments = [];
        
        foreach ($files as $fileData) {
            if (isset($fileData['file']) && isset($fileData['type'])) {
                $attachments[] = $this->storeIDAttachment(
                    $fileData['file'],
                    $customerApplication,
                    $fileData['type']
                );
            }
        }
        
        return $attachments;
    }
}
