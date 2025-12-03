<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function fetch(Request $request){

        $user_id = $request->user_id;
        $notifications = Notification::where('user_id', $user_id)
        ->orderBy('created_at', 'desc')
        ->get();
              
    
        return response()->json([
            'user_id' => $user_id,
            'notifications' => $notifications,
        ]);
    }
}
