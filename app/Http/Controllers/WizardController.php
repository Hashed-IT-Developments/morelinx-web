<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class WizardController extends Controller
{
    public function validateStep(Request $request, string $step)
    {
        $rules = [];

        switch ($step) {
            case 'step1':
                $rules = [];
                // $rules = [
                //     // Account Info
                //     'rate_class' => 'required|string',
                //     'customer_type' => 'required|string',
                //     'connected_load' => 'required|numeric',
                //     'property_ownership' => 'required|string',
                //     'last_name' => 'required|string|min:2|max:50',
                //     'first_name' => 'required|string|min:3|max:50',
                //     'middle_name' => 'nullable|string|min:3|max:50',
                //     'suffix' => 'nullable|string|max:10',
                //     'birthdate' => 'required|date',
                //     'nationality' => 'required|string|max:50',
                //     'sex' => 'required|in:male,female,other',
                //     'marital_status' => 'required|string|max:20',
                // ];
                break;
            case 'step2':
                $rules = [];
                break;
            case 'step3':
                $rules = ['address' => 'required|string|max:255'];
                break;
        }

        $validated = $request->validate($rules);

        return back()->with([
            'success' => true,
            'data' => $validated,
        ]);
    }

    public function complete(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string|max:50',
            'email' => 'required|email',
            'address' => 'required|string|max:255',
            'preferences' => 'nullable|string',
        ]);

        // Save to DB or process

        return Inertia::render('Wizard/Complete', [
            'message' => 'Wizard completed successfully!',
        ]);
    }
}
