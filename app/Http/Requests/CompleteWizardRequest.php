<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteWizardRequest extends FormRequest
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
            'rate_class' => 'required|string|max:255',
            'customer_type' => 'required|string|max:255',
            'connected_load' => 'required|numeric',
            'property_ownership' => 'required|string|max:255',
            'last_name' => 'required|string|min:2|max:50',
            'first_name' => 'required|string|min:3|max:50',
            'middle_name' => 'nullable|string|min:3|max:50',
            'suffix' => 'nullable|string|max:10',
            'birthdate' => 'required|date',
            'nationality' => 'required|string|max:50',
            'sex' => 'required|string|max:10',
            'marital_status' => 'required|string|max:10',
            'landmark' => 'nullable|string|max:255',
            'unit_no' => 'nullable|string|max:50',
            'building_floor' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:255',
            'subdivision' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'barangay' => 'required|string|max:255',
            // 'sketch' => 'required|image|mimes:jpg,jpeg,png,pdf|max:2048',
            'sketch' => '',
            'cp_lastname' => 'required|string|min:2|max:50',
            'cp_firstname' => 'required|string|min:3|max:50',
            'cp_middlename' => 'nullable|string|min:3|max:50',
            'relationship' => 'required|string|max:50',
            'cp_email' => 'nullable|email|max:100',
            'cp_tel_no' => 'nullable|string|max:20',
            'cp_tel_no_2' => 'nullable|string|max:20',
            'cp_mobile_no' => 'required|string|max:20',
            'cp_mobile_no_2' => 'nullable|string|max:20',
            'id_type' => 'required|string|max:100',
            'id_number' => 'required|string|max:100',
            'id_type_2' => 'nullable|string|max:100',
            'id_number_2' => 'nullable|string|max:100',
            'is_senior_citizen' => 'required|boolean',
            'sc_from' => 'nullable|date',
            'sc_number' => 'nullable|string|max:100',
            // 'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'attachments.*' => '',
            'bill_district' => 'required|string|max:255',
            'bill_barangay' => 'required|string|max:255',
            'bill_subdivision' => 'nullable|string|max:255',
            'bill_street' => 'nullable|string|max:255',
            'bill_building_floor' => 'nullable|string|max:255',
            'bill_house_no' => 'nullable|string|max:50',
            'bill_delivery' => 'required|string|max:50',
        ];
    }
}
