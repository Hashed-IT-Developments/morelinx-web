<?php

namespace App\Http\Controllers;

use App\Enums\DUEnum;
use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BarangayController extends Controller
{
    public function apiGet(Town $town) {
        $data = Barangay::where('town_id', $town->id)
                ->orderBy('name')
                ->get(['id', 'name']);

        return response()->json($data);
    }

    public function getWithTownApi() {
        $data = Barangay::whereHas('town', function($q){
            $q->where('du_tag', env('DU_TAG'));
        })->orderBy('name')
        ->with('town')
        ->get()->map(function($row) {
            return [
                'id' => $row->id,
                'name' => $row->name . ", " . $row->town->name
            ];
        });

        return response()->json($data);
    }
}
