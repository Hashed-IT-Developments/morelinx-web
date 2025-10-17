<?php

namespace App\Http\Requests;

use App\Enums\InspectionStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInspectionStatusRequest extends FormRequest
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
            'status' => ['required', Rule::in([
                InspectionStatusEnum::FOR_INSPECTION,
                InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
                InspectionStatusEnum::FOR_APPROVAL,
                InspectionStatusEnum::APPROVED,
                InspectionStatusEnum::DISAPPROVED,
                'pending'
            ])],
        ];
    }
}
