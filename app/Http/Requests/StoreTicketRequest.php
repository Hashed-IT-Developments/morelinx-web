<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
  
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'nullable|exists:customer_accounts,id',
            'account_number' => 'nullable|exists:customer_accounts,account_number',
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
            'channel' => 'required|string',
            'reason' => 'nullable|string',
            'severity' => 'required|in:low,medium,high',
            'assignation_type' => 'required|in:user,department',
            'assign_user_id' => 'nullable|exists:users,id',
            'assign_department_id' => 'nullable|exists:roles,id',
            'remarks' => 'nullable|string',
            'submission_type' => 'required|in:log,ticket',
        ];
    }

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
            'account_number.exists' => 'The specified account number does not exist.',
            'channel.required' => 'Channel is required.',
            'channel.string' => 'Channel must be a string.',
            'submission_type.required' => 'Please specify whether to submit as log or ticket.',
            'submission_type.in' => 'Submit as must be either log or ticket.',
        ];
    }


    public function attributes(): array
    {
        return [
            'consumer_name' => 'consumer name',
            'caller_name' => 'caller name',
            'phone' => 'phone number',
            'account_number' => 'account number',
            'district' => 'district',
            'barangay' => 'barangay',
            'ticket_type' => 'ticket type',
            'concern_type' => 'concern type',
            'concern' => 'details of concern',
            'assign_user_id' => 'assigned user',
            'assign_department_id' => 'assigned department',
            'submission_type' => 'submission type',
        ];
    }
}
