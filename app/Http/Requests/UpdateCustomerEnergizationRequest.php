<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerEnergizationRequest extends FormRequest
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
            'status'                => 'nullable|string',
            'team_assigned'         => 'nullable|exists:users,id',
            'service_connection'    => 'nullable|string',
            'action_taken'          => 'nullable|string',
            'remarks'               => 'nullable|string',
            'time_of_arrival'       => 'nullable|date',
            'date_installed'        => 'nullable|date',
            'transformer_owned'     => 'nullable|string',
            'transformer_rating'    => 'nullable|string',
            'ct_serial_number'      => 'nullable|string',
            'ct_brand_name'         => 'nullable|string',
            'ct_ratio'              => 'nullable|string',
            'pt_serial_number'      => 'nullable|string',
            'pt_brand_name'         => 'nullable|string',
            'pt_ratio'              => 'nullable|string',
            'team_executed'         => 'nullable|exists:users,id',
            'archive'               => 'boolean',

            'meters' => 'sometimes|array',
            'meters.*.meter_id' => 'sometimes|exists:meters,id',
            'meters.*.meter_serial_number' => 'required_without:meters.*.meter_id|string',
            'meters.*.meter_brand' => 'nullable|string',
            'meters.*.seal_number' => 'nullable|string',
            'meters.*.erc_seal' => 'nullable|string',
            'meters.*.more_seal' => 'nullable|string',
            'meters.*.multiplier' => 'nullable|numeric',
            'meters.*.voltage' => 'nullable|numeric',
            'meters.*.initial_reading' => 'nullable|numeric',
            'meters.*.type' => 'nullable|string',

            'attachments'   => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png',
        ];
    }
}
