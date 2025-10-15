<?php

namespace App\Http\Controllers;

use App\Models\Town;
use Illuminate\Http\Request;

class TownController extends Controller
{
    public function apiGet() {
        $towns = Town::orderBy('name')
            ->get(['id', 'name']);
        return response()->json($towns);
    }
}
