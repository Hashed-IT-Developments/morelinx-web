<?php

namespace App\Http\Controllers\Tests;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MobileTestController extends Controller
{
    public function createInspection()
    {
        return inertia('mobile-tests/create-inspection-test', [
            'inspectors' => function () {
                $inspectors = User::whereHas('roles', function($query) {
                    $query->where('name', 'inspector');
                })->get();

                return $inspectors;
            }
        ]);
    }
}
