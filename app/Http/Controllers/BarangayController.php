<?php

namespace App\Http\Controllers;

use App\Enums\DUEnum;
use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;
use Exception;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'town_id' => 'required|integer|exists:towns,id',
        ]);

        try {
            Barangay::create($validated);

            return redirect()->back()->with('success', 'Barangay created successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to create barangay: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Barangay $barangay)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'town_id' => 'required|integer|exists:towns,id',
        ]);

        try {
            $barangay->update($validated);
            return redirect()->back()->with('success', 'Barangay updated successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to update barangay: ' . $e->getMessage());
        }
    }
}
