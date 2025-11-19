<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeterRequest extends FormRequest
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
        $meterId = $this->route('meter')->id;

        return [
            'meter_serial_number'       => 'sometimes|string|unique:meters,meter_serial_number,' . $meterId,
            'meter_brand'               => 'nullable|string',
            'seal_number'               => 'nullable|string',
            'erc_seal'                  => 'nullable|string',
            'more_seal'                 => 'nullable|string',
            'multiplier'                => 'nullable|numeric',
            'voltage'                   => 'nullable|numeric',
            'initial_reading'           => 'nullable|numeric',
            'type'                      => 'nullable|string',
        ];
    }
}
