<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $params = $request->all();

        $users = User::where('name', 'LIKE', "%{$params['search']}%")
            ->orWhere('email', 'LIKE', "%{$params['search']}%")
            ->limit($params['limit'])
            ->get();

        return response()->json($users);
    }
}
