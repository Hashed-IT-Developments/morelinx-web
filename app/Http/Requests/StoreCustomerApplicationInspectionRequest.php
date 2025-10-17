<?php

namespace App\Http\Requests;

use App\Enums\InspectionStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerApplicationInspectionRequest extends FormRequest
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
            'customer_application_id'   => ['required', 'integer', 'exists:customer_applications,id'],
            'inspector_id'              => ['nullable', 'integer', 'exists:users,id'],
            'status'                    => ['nullable', Rule::in([
                InspectionStatusEnum::FOR_INSPECTION,
                InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
                InspectionStatusEnum::FOR_APPROVAL,
                InspectionStatusEnum::APPROVED,
                InspectionStatusEnum::DISAPPROVED,
                'pending'
            ])],
            'house_loc'             => 'nullable|string',
            'meter_loc'             => 'nullable|string',
            'sketch_loc'            => 'nullable|string',
            'near_meter_serial_1'   => 'nullable|string',
            'near_meter_serial_2'   => 'nullable|string',
            'schedule_date'         => 'nullable|date',
            'bill_deposit'          => 'nullable|numeric',
            'labor_cost'            => 'nullable|numeric',
            'feeder'                => 'nullable|string',
            'meter_type'            => 'nullable|string',
            'service_drop_size'     => 'nullable|string',
            'protection'            => 'nullable|string',
            'meter_class'           => 'nullable|string',
            'connected_load'        => 'nullable|string',
            'transformer_size'      => 'nullable|string',
            'signature'             => 'nullable|string',
            'remarks'               => 'nullable|string',
        ];
    }
}
