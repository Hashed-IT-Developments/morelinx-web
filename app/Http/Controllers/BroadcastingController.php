<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BroadcastingController extends Controller
{
      public function authenticate(Request $request)
    {
        
        $user = Auth::user(); 

        if (!$user) {
            return response('Unauthorized', 403);
        }

        $channelName = $request->channel_name; 
       
        if (str_starts_with($channelName, 'private-')) {
            $channelName = substr($channelName, 8);
        }

        $parts = explode('.', $channelName); 
        $channelUserId = $parts[3] ?? null;

        if ((int) $user->id !== (int) $channelUserId) {
            return response('Forbidden', 403);
        }

       
        return response()->json(['authorized' => true]);
    }
}
