<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;

class ImageController extends Controller
{
    public function optimize(Request $request)
    {
        ini_set('memory_limit', '256M');

        $src    = $request->query('src');
        $width  = (int) $request->query('w');
        $height = (int) $request->query('h'); 
        $format = $request->query('fm');      
        $quality = 80;

        if (!$src) {
            abort(400, 'No image specified.');
        }

        $normalizedSrc = $src[0] !== '/' ? "/{$src}" : $src;
        $path = public_path($normalizedSrc);

        if (!file_exists($path)) {
            abort(404, 'Image not found.');
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($ext === 'svg') {
            return response()->file($path, [
                'Content-Type' => 'image/svg+xml',
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        }

        $format = $format ?: $ext;
        $format = match ($format) {
            'webp' => 'webp',
            'png'  => 'png',
            default => 'jpg',
        };

        $mimeType = match ($format) {
            'webp' => 'image/webp',
            'png'  => 'image/png',
            default => 'image/jpeg',
        };

        $manager = new ImageManager(new Driver());
        $image = $manager->read($path);
        if (!$image) {
            abort(500, 'Failed to process image.');
        }
        
      
        $quality = $format === 'png' ? null : 80;
        
        if ($width || $height) {
          
            if ($width && $height) {
               
                $image->resize($width, $height);
            } elseif ($width) {
              
                $image->scale(width: $width);
            } elseif ($height) {
              
                $image->scale(height: $height);
            }
        }

        $encoder = match ($format) {
            'png'  => new PngEncoder(), 
            'webp' => new WebpEncoder($quality),
            default => new JpegEncoder($quality),
        };

        $encoded = $image->encode($encoder);

        return response($encoded->toString(), 200, [
            'Content-Type'  => $mimeType,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
