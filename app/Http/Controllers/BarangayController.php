<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;

class BarangayController extends Controller
{
    public function apiGet(Town $town) {
        $data = Barangay::where('town_id', $town->id)
                ->orderBy('name')
                ->get(['id', 'name']);
                
        return response()->json($data);
    }
}
