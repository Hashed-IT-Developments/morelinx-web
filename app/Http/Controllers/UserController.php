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
            ->whereHas('roles', function ($query) use ($params) {
                if (isset($params['roles']) && is_array($params['roles'])) {
                    $query->whereIn('name', $params['roles']);
                }
            })
            ->limit($params['limit'])
            ->get();

        return response()->json($users);
    }
}
