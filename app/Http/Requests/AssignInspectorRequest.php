<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignInspectorRequest extends FormRequest
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
        return [
            'inspection_id' => 'required|exists:cust_appln_inspections,id',
            'inspector_id' => 'required|exists:users,id',
            'schedule_date' => 'required|date|after_or_equal:today',
        ];
    }
}
