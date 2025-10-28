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
        $towns = Town::query()
            ->when($request->input('search'), function ($query, $search) {
                $search = strtolower($search);
                $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(feeder) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(du_tag) LIKE ?', ["%{$search}%"]);
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($town) => [
                'id' => $town->id,
                'name' => $town->name,
                'feeder' => $town->feeder,
                'du_tag' => $town->du_tag,
            ]);

        return Inertia::render('miscellaneous/addresses/towns/index', [
            'towns' => $towns,
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
