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
            'severity'            => ['nullable', 'string', 'max:50'],
            'status' => [
                'required',
                'string',
                'in:' . implode(',', TicketStatusEnum::getValues()),
            ],
            'executed_by_id'        => ['nullable', 'integer', 'exists:users,id'],
            'actual_findings_id'    => ['nullable', 'integer', 'exists:ticket_types,id'],
            'action_plan'           => ['nullable', 'string'],
            'remarks'               => ['nullable', 'string'],
            'date_arrival'          => ['nullable', 'date', 'date_format:Y-m-d H:i:s'],
            'date_dispatched'       => ['nullable', 'date', 'date_format:Y-m-d H:i:s'],
            'date_accomplished'     => ['nullable', 'date', 'date_format:Y-m-d H:i:s'],

        ];
    }
}
