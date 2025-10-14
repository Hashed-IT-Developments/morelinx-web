<?php

namespace App\Http\Controllers;

use App\Enums\DUEnum;
use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BarangayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Barangay $barangay)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Barangay $barangay)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Barangay $barangay)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Barangay $barangay)
    {
        //
    }

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
