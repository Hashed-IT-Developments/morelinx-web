<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialItemRequest extends FormRequest
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
            'material'  => ['required', 'string', 'max:255', 'unique:material_items,material'],
            'cost'      => ['required', 'numeric', 'min:0']
        ];
    }

    public function messages(): array
    {
        return [
            'material.required' => 'Material name required',
            'material.unique'   => 'Material already exists.',
            'cost.required'     => 'Cost is required.',
            'cost.numeric'      => 'Cost must be a number.'
        ];
    }
}
