<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Set to true to allow all authenticated users
        // Or add your authorization logic here
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
            'account_id' => 'nullable|exists:customer_accounts,id',
            'consumer_name' => 'required|string|max:255',
            'caller_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'district' => 'required|exists:towns,id',
            'barangay' => 'required|exists:barangays,id',
            'landmark' => 'nullable|string|max:255',
            'sitio' => 'nullable|string|max:255',
            'ticket_type' => 'required',
            'concern_type' => 'required',
            'concern' => 'required|string',
            'reason' => 'nullable|string',
            'severity' => 'required|in:low,medium,high',
            'assignation_type' => 'required|in:user,department',
            'assign_user_id' => 'required_if:assignation_type,user|nullable|exists:users,id',
            'assign_department_id' => 'required_if:assignation_type,department|nullable|exists:roles,id',
            'remarks' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'consumer_name.required' => 'Consumer name is required.',
            'caller_name.required' => 'Caller name is required.',
            'phone.required' => 'Phone number is required.',
            'district.required' => 'District is required.',
            'district.exists' => 'The selected district is invalid.',
            'barangay.required' => 'Barangay is required.',
            'barangay.exists' => 'The selected barangay is invalid.',
            'ticket_type.required' => 'Ticket type is required.',
            'ticket_type.exists' => 'The selected ticket type is invalid.',
            'concern_type.required' => 'Concern type is required.',
            'concern_type.exists' => 'The selected concern type is invalid.',
            'concern.required' => 'Details of concern is required.',
            'severity.required' => 'Severity level is required.',
            'severity.in' => 'Severity must be low, medium, or high.',
            'assignation_type.required' => 'Assignment type is required.',
            'assignation_type.in' => 'Assignment type must be user or department.',
            'assign_user_id.required_if' => 'Please select a user to assign.',
            'assign_user_id.exists' => 'The selected user is invalid.',
            'assign_department_id.required_if' => 'Please select a department to assign.',
            'assign_department_id.exists' => 'The selected department is invalid.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'consumer_name' => 'consumer name',
            'caller_name' => 'caller name',
            'phone' => 'phone number',
            'district' => 'district',
            'barangay' => 'barangay',
            'ticket_type' => 'ticket type',
            'concern_type' => 'concern type',
            'concern' => 'details of concern',
            'assign_user_id' => 'assigned user',
            'assign_department_id' => 'assigned department',
        ];
    }
}
