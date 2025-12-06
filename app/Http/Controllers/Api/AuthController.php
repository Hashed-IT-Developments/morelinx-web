<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login'     => 'required|string',
            'password'  => 'required|string',
        ]);

        $login = $credentials['login'];

        $isEmail = filter_var($login, FILTER_VALIDATE_EMAIL);

        // Find user by appropriate column
        if ($isEmail) {
            $user = User::where('email', $login)->first();
        } else {
            $user = User::whereRaw('LOWER(username) = ?', [strtolower($login)])->first();
        }

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken($user->name);

        $user->load('roles');

        return response()->json([
            'token'         => $token->plainTextToken,
            'token_type'    => 'Bearer',
            'user'          => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message'=>'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('roles');
        return response()->json($request->user());
    }
}
