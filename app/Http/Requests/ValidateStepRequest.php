<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateStepRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $step = $this->route('step'); // Get step from route parameter

        return match ($step) {
            'step1' => [
                'rate_class' => 'required|string',
                'customer_type' => 'required|string',
                'connected_load' => 'required|numeric',
                'property_ownership' => 'required|string',
                'last_name' => 'required|string|min:2|max:50',
                'first_name' => 'required|string|min:3|max:50',
                'middle_name' => 'nullable|string|min:3|max:50',
                'suffix' => 'nullable|string|max:10',
                'birthdate' => 'required|date',
                'nationality' => 'required|string|max:50',
                'sex' => 'required|in:male,female,other',
                'marital_status' => 'required|string|max:20',
            ],
            'step2' => [
                // Add rules for step2 when ready
            ],
            'step3' => [
                'address' => 'required|string|max:255',
            ],
            default => [],
        };
    }
}
