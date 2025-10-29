<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BroadcastingController extends Controller
{
    /**
     * Authenticate the user's WebSocket connection.
     */
    public function authenticate(Request $request)
    {
        // Authenticate using API token from Authorization header
        $user = Auth::user(); // or your custom guard

        if (!$user) {
            return response('Unauthorized', 403);
        }

        // Extract user ID from the channel name
        $channelName = $request->channel_name; // e.g., private-App.Models.User.1
        // Remove the 'private-' prefix
        if (str_starts_with($channelName, 'private-')) {
            $channelName = substr($channelName, 8);
        }

        $parts = explode('.', $channelName); // ['App', 'Models', 'User', '1']
        $channelUserId = $parts[3] ?? null;

        if ((int) $user->id !== (int) $channelUserId) {
            return response('Forbidden', 403);
        }

        // Return the required authorization payload for Reverb
        return response()->json(['authorized' => true]);
    }
}
