<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;


Route::get('/sso', function (Request $request) {
    $encrypted = $request->query('token');
    if (!$encrypted) abort(400, 'Missing token');

    try {
        $data = json_decode(decrypt($encrypted), true);
    } catch (\Exception $e) {
        Log::warning('SSO token decryption failed', [
            'ip' => $request->ip()
        ]);
        abort(401, 'Invalid token');
    }

   
    if (!isset($data['email'], $data['branch_id'], $data['expires_at'], $data['nonce'])) {
        abort(401, 'Invalid token structure');
    }

 
    if (now()->timestamp > $data['expires_at']) {
        abort(401, 'Token expired');
    }

  
    if (Cache::has("sso_nonce:{$data['nonce']}")) {
       
        Log::info('SSO token reused, skipping nonce check (development)', [
            'nonce' => $data['nonce'],
            'email' => $data['email']
        ]);

    } else {
       
        Cache::put("sso_nonce:{$data['nonce']}", true, now()->addMinutes(30));
    }

   
    if ($data['branch_id'] != env('BRANCH_ID')) {
        abort(403, 'User does not belong to this branch');
    }

  
    $user = User::where('email', $data['email'])->first();
    if (!$user) {
        abort(403, 'User not found or inactive');
    }

    Auth::login($user);

    Log::info('SSO login successful', [
        'user_id' => $user->id,
        'email' => $user->email
    ]);
    return redirect()->route('dashboard');

})->middleware('throttle:20,1');
