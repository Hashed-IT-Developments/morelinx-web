<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
   public function handle(Request $request, Closure $next)
    {
        $origins = config('cors.allowed_origins');
        $methods = implode(',', config('cors.allowed_methods'));
        $headers = implode(',', config('cors.allowed_headers'));
        $supportsCredentials = config('cors.supports_credentials') ? 'true' : 'false';

        if ($request->getMethod() === "OPTIONS") {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origins[0])
                ->header('Access-Control-Allow-Methods', $methods)
                ->header('Access-Control-Allow-Headers', $headers)
                ->header('Access-Control-Allow-Credentials', $supportsCredentials);
        }

        $response = $next($request);
        $response->headers->set('Access-Control-Allow-Origin', $origins[0]);
        $response->headers->set('Access-Control-Allow-Methods', $methods);
        $response->headers->set('Access-Control-Allow-Headers', $headers);
        $response->headers->set('Access-Control-Allow-Credentials', $supportsCredentials);

        return $response;
    }
}
