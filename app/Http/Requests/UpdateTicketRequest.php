<?php

namespace App\Http\Requests;

use App\Enums\TicketStatusEnum;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                'in:' . implode(',', TicketStatusEnum::getValues()),
            ],
            'actual_findings_id'    => ['nullable', 'integer', 'exists:ticket_types,id'],
            'action_plan'           => ['nullable', 'string'],
            'remarks'               => ['nullable', 'string'],
            'date_arrival'          => ['nullable'],
            'date_dispatched'       => ['nullable'],
            'date_accomplished'     => ['nullable'],

            'attachment'            => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'attachments'           => ['nullable', 'array'],
            'attachments.*'         => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
