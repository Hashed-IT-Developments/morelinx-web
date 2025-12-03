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
            'status'                 => ['required', Rule::in([
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
            'signature'              => [
                            'nullable',
                            'string',
                            'regex:/^(?:data:image\/(?:png|jpe?g);base64,)?[A-Za-z0-9+\/=]+$/'
                        ],

            'remarks'                => 'nullable|string',

            'materials'                     => ['nullable', 'array'],
            'materials.*.material_item_id'  => ['nullable', 'exists:material_items,id'],
            'materials.*.material_name'     => ['required_with:materials', 'string'],
            'materials.*.unit'              => ['nullable', 'string'],
            'materials.*.quantity'          => ['required_with:materials', 'numeric', 'min:1'],
            'materials.*.amount'            => ['required_with:materials', 'numeric', 'min:0'],
        ];
    }
}
