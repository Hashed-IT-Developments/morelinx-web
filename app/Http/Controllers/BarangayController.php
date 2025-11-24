<?php

namespace App\Http\Controllers;

use App\Enums\DUEnum;
use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

    public function index(Request $request): \Inertia\Response
    {
        $searchTerm = $request->input('search');
        $perPage = $request->input('per_page', 15);
        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $query = Barangay::query()
            ->select(['id', 'name', 'town_id', 'alias'])
            ->with('town:id,name');

        if ($searchTerm) {
            $search = strtolower($searchTerm);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                ->orWhereHas('town', function ($query) use ($search) {
                    $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                });
        }

       
        if ($sortField && $sortDirection) {
            if ($sortField === 'townName') {
              
                $query->join('towns', 'barangays.town_id', '=', 'towns.id')
                    ->orderBy('towns.name', $sortDirection)
                    ->select('barangays.*'); 
            } else {
                $query->orderBy($sortField, $sortDirection);
            }
        }

        $barangays = $query->paginate($perPage)
            ->withQueryString()
            ->through(fn($barangay) => [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'townId' => $barangay->town_id,
                'alias' => $barangay->alias,
                'townName' => $barangay->town->name ?? 'N/A',
            ]);

        return Inertia::render('miscellaneous/addresses/barangays/index', [
            'barangays' => $barangays,
            'search' => $searchTerm,
            'currentSort' => [
                'field' => $sortField !== 'name' ? $sortField : null,
                'direction' => $sortField !== 'name' ? $sortDirection : null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'town_id' => 'required|integer|exists:towns,id',
            'barangays' => 'required|array|min:1',
            'barangays.*.name' => 'required|string|max:255',
            'barangays.*.alias' => 'required|string|max:3|unique:barangays,alias',
        ]);

        try {
            $createdCount = 0;

            DB::beginTransaction();

            foreach ($validated['barangays'] as $barangayData) {
                Barangay::create([
                    'name' => $barangayData['name'],
                    'town_id' => $validated['town_id'],
                    'alias' => $barangayData['alias'],
                ]);
                $createdCount++;
            }

            DB::commit();

            $message = $createdCount === 1
                ? 'Barangay created successfully!'
                : "{$createdCount} barangays created successfully!";

            return redirect()->back()->with('success', $message);
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create barangay(s): ' . $e->getMessage());
        }
    }

    public function update(Request $request, Barangay $barangay)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'town_id' => 'required|integer|exists:towns,id',
            'alias' => 'required|string|max:3|unique:barangays,alias,' . $barangay->id,
        ]);

        try {
            $barangay->update($validated);
            return redirect()->back()->with('success', 'Barangay updated successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to update barangay: ' . $e->getMessage());
        }
    }

    public function checkBarangayAlias(Request $request)
    {
        $alias = $request->input('alias');
        $barangayId = $request->input('barangay_id');

        if (!$alias) {
            return response()->json(['available' => true]);
        }

        $query = Barangay::where('alias', $alias);

        if ($barangayId) {
            $query->where('id', '!=', $barangayId);
        }

        $exists = $query->exists();

        return response()->json(['available' => !$exists]);
    }
}
