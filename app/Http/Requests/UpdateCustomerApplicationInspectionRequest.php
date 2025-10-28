<?php

namespace App\Http\Requests;

use App\Enums\InspectionStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerApplicationInspectionRequest extends FormRequest
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
            'status'                    => ['required', Rule::in([
                InspectionStatusEnum::APPROVED,
                InspectionStatusEnum::DISAPPROVED,
            ])],
            'house_loc'              => 'nullable|string',
            'meter_loc'              => 'nullable|string',
            'schedule_date'          => 'nullable|date',
            'sketch_loc'             => 'nullable|string',
            'near_meter_serial_1'    => 'nullable|string',
            'near_meter_serial_2'    => 'nullable|string',
            'bill_deposit'           => 'nullable|numeric',
            'material_deposit'       => 'nullable|numeric',
            'total_labor_costs'      => 'nullable|numeric',
            'labor_cost'             => 'nullable|numeric',
            'feeder'                 => 'nullable|string',
            'meter_type'             => 'nullable|string',
            'service_drop_size'      => 'nullable|string',
            'protection'             => 'nullable|string',
            'meter_class'            => 'nullable|string',
            'connected_load'         => 'nullable|string',
            'transformer_size'       => 'nullable|string',
            // signature can be either a base64/data-uri string (uploaded) or an existing path string.
            'signature'            => [
                                        'nullable',
                                        'string',
                                        'regex:/^(data:image\/(png|jpeg|jpg);base64,)?[A-Za-z0-9+\/=\s]+$/'
                                    ],
            'remarks'                => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'signature.regex' => 'Signature must be a base64 string or a data URI (e.g. data:image/png;base64,...).',
        ];
    }
}
