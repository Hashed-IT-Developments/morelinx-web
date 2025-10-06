<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteWizardRequest;
use App\Http\Requests\ValidateStepRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WizardController extends Controller
{
    public function validateStep(ValidateStepRequest $request)
    {
        return back()->with([
            'success' => true,
            'data' => $request->validated(),
        ]);
    }

    public function complete(CompleteWizardRequest $request)
    {
        // Save to DB or process

        return Inertia::render('Wizard/Complete', [
            'message' => 'Wizard completed successfully!',
        ]);
    }
}
