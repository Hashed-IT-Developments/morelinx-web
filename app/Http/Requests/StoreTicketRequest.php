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
            'tickets' => 'required|array', // The root array of tickets
            'tickets.*.account_id' => 'nullable|exists:customer_accounts,id',
            'tickets.*.account_number' => 'nullable',
            'tickets.*.consumer_name' => 'required|string|max:255',
            'tickets.*.caller_name' => 'required|string|max:255',
            'tickets.*.phone' => 'required|string|max:20',
            'tickets.*.district' => 'required|exists:towns,id',
            'tickets.*.barangay' => 'required|exists:barangays,id',
            'tickets.*.landmark' => 'nullable|string|max:255',
            'tickets.*.sitio' => 'nullable|string|max:255',
            'tickets.*.ticket_type' => 'required',
            'tickets.*.concern_type' => 'required',
            'tickets.*.concern' => 'required|string',
            'tickets.*.channel' => 'required|string',
            'tickets.*.reason' => 'nullable|string',
            'tickets.*.severity' => 'required|in:low,medium,high',
            'tickets.*.assignation_type' => 'nullable|in:user,department',
            'tickets.*.assign_user_id' => 'nullable|exists:users,id',
            'tickets.*.assign_department_id' => 'nullable|exists:roles,id',
            'tickets.*.remarks' => 'nullable|string',
            'tickets.*.submission_type' => 'required|in:log,ticket',
            'tickets.*.mark_as_completed' => 'nullable|boolean',
        ];
    }


    public function messages(): array
    {
        return [
            'tickets.*.consumer_name.required' => 'Consumer name is required.',
            'tickets.*.caller_name.required' => 'Caller name is required.',
            'tickets.*.phone.required' => 'Phone number is required.',
            'tickets.*.district.required' => 'District is required.',
            'tickets.*.district.exists' => 'The selected district is invalid.',
            'tickets.*.barangay.required' => 'Barangay is required.',
            'tickets.*.barangay.exists' => 'The selected barangay is invalid.',
            'tickets.*.ticket_type.required' => 'Ticket type is required.',
            'tickets.*.concern_type.required' => 'Concern type is required.',
            'tickets.*.concern.required' => 'Details of concern is required.',
            'tickets.*.severity.required' => 'Severity level is required.',
            'tickets.*.severity.in' => 'Severity must be low, medium, or high.',
            'tickets.*.assignation_type.in' => 'Assignment type must be user or department.',
            'tickets.*.channel.required' => 'Channel is required.',
            'tickets.*.submission_type.required' => 'Please specify whether to submit as log or ticket.',
            'tickets.*.submission_type.in' => 'Submit as must be either log or ticket.',
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
