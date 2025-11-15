<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerEnergizationRequest extends FormRequest
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
            'customer_application_id'   => 'required|exists:customer_applications,id',
            'status'                    => 'nullable|string|max:255',
            'team_assigned'             => 'nullable|exists:users,id',
            'service_connection'        => 'nullable|string|max:255',
            'action_taken'              => 'nullable|string|max:255',
            'remarks'                   => 'nullable|string',
            'time_of_arrival'           => 'nullable|date',
            'date_installed'            => 'nullable|date',
            'transformer_owned'         => 'nullable|string|max:255',
            'transformer_rating'        => 'nullable|string|max:255',
            'ct_serial_number'          => 'nullable|string|max:255',
            'ct_brand_name'             => 'nullable|string|max:255',
            'ct_ratio'                  => 'nullable|string|max:255',
            'pt_serial_number'          => 'nullable|string|max:255',
            'pt_brand_name'             => 'nullable|string|max:255',
            'pt_ratio'                  => 'nullable|string|max:255',
            'team_executed'             => 'nullable|exists:users,id',
            'archive'                   => 'boolean',
        ];
    }
}
