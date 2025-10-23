<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMaterialItemRequest extends FormRequest
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
            'material'  => ['required', 'string', 'max:255', Rule::unique('material_items', 'material')
                ->ignore($this->material_item)],
            'cost'      => ['required', 'numeric', 'min:0']
        ];
    }

    public function messages(): array
    {
        return [
            'material.required' => 'The material name is required.',
            'material.unique'   => 'This material already exists.',
            'cost.required'     => 'The cost is required.',
            'cost.numeric'      => 'The cost must be a number.'
        ];
    }
}
