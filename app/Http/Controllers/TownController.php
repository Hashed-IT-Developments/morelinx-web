<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class TownController extends Controller
{
    public function apiGet() {
        $towns = Town::orderBy('name')
            ->get(['id', 'name']);
        return response()->json($towns);
    }

    public function index(Request $request): \Inertia\Response
    {
        $towns = Town::with(['barangays' => function ($query) {
                $query->orderBy('name');
            }])
            ->when($request->input('search_town'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('feeder', 'like', "%{$search}%")
                    ->orWhere('du_tag', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(15, ['*'], 'towns_page')
            ->withQueryString()
            ->through(fn($town) => [
                'id' => $town->id,
                'name' => $town->name,
                'feeder' => $town->feeder,
                'du_tag' => $town->du_tag,
                'barangays' => $town->barangays->map(fn($barangay) => [
                    'id' => $barangay->id,
                    'name' => $barangay->name,
                ]),
            ]);

        $barangays = Barangay::with('town')
            ->when($request->input('search_barangay'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('town', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('name')
            ->paginate(15, ['*'], 'barangays_page')
            ->withQueryString()
            ->through(fn($barangay) => [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'townId' => $barangay->town_id,
                'townName' => $barangay->town->name ?? 'N/A',
            ]);

        return Inertia::render('miscellaneous/addresses/index', [
            'towns' => $towns,
            'barangays' => $barangays,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'feeder' => 'required|string|max:255',
        ]);

        $validated['du_tag'] = config('app.du_tag');

        try {
            Town::create($validated);

            return redirect()->back()->with('success', 'Town created successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to create town: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Town $town)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'feeder' => 'required|string|max:255',
        ]);

        try {
            $town->update($validated);
            return redirect()->back()->with('success', 'Town updated successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to update town: ' . $e->getMessage());
        }
    }
}
