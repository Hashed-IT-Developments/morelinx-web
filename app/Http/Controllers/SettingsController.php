<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        $settings = Setting::all()->keyBy('key')->map(function ($setting) {
            return [
                'value' => $setting->value,
                'type' => $setting->type,
                'description' => $setting->description,
            ];
        });

        return Inertia::render('settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update a specific setting.
     */
    public function update(Request $request, string $key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        // Validate based on type
        $rules = match ($setting->type) {
            'float' => ['required', 'numeric', 'min:0'],
            'integer' => ['required', 'integer', 'min:0'],
            'boolean' => ['required', 'boolean'],
            default => ['required', 'string'],
        };

        $validated = $request->validate([
            'value' => $rules,
        ]);

        $setting->update([
            'value' => $validated['value'],
        ]);

        return redirect()->back()->with('success', 'Setting updated successfully.');
    }
}
