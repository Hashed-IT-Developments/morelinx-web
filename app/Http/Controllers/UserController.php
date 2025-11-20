<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $params = $request->all();

        $users = User::whereHas('roles', function ($query) use ($params) {
            if (isset($params['roles']) && is_array($params['roles'])) {
                $query->whereIn('name', $params['roles']);
            }
            })
            ->when(isset($params['search']) && $params['search'], function ($query) use ($params) {
            $query->where(function ($q) use ($params) {
                $q->where('name', 'LIKE', "%{$params['search']}%")
                  ->orWhere('email', 'LIKE', "%{$params['search']}%");
            });
            })
            ->limit($params['limit'])
            ->get();

        return response()->json($users);
    }
}
