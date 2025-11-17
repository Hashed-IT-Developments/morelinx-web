<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteWizardRequest extends FormRequest
{
    // Constants for better maintainability
    private const RATE_CLASS_RESIDENTIAL = 'residential';
    private const RATE_CLASS_COMMERCIAL = 'commercial';
    private const RATE_CLASS_POWER = 'power';
    private const RATE_CLASS_CITY_OFFICES = 'city_offices';
    private const RATE_CLASS_CITY_STREETLIGHTS = 'city_streetlights';
    private const RATE_CLASS_OTHER_GOVERNMENT = 'other_government';

    private const CUSTOMER_TYPE_TEMPORARY_RESIDENTIAL = 'temporary_residential';

    // Common file validation rules
    private const FILE_VALIDATION_RULES = 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120';
    private const OPTIONAL_FILE_VALIDATION_RULES = 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120';

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
        $rateClass = $this->input('rate_class');
        $customerType = $this->input('customer_type');

        $baseRules = $this->getBaseRules();
        $conditionalRules = $this->getConditionalRules($rateClass, $customerType);

        return array_merge($baseRules, $conditionalRules);
    }

    /**
     * Get base validation rules that apply to all requests
     */
    private function getBaseRules(): array
    {
        return [
            'rate_class' => 'required|string|max:255',
            'customer_type' => 'required|string|max:255',

            // Address Information
            'landmark' => 'nullable|string|max:255',
            'unit_no' => 'nullable|string|max:50',
            'building_floor' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:255',
            'subdivision' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'barangay' => 'required|string|max:255',
            'sketch_lat_long' => 'required|string|regex:/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/',
        ];
    }

    /**
     * Get conditional validation rules based on rate class and customer type
     */
    private function getConditionalRules(string $rateClass, ?string $customerType): array
    {
        return match ($rateClass) {
            self::RATE_CLASS_RESIDENTIAL => $this->getResidentialRules(),
            self::RATE_CLASS_COMMERCIAL => $this->getCommercialRules(),
            self::RATE_CLASS_POWER => $this->getPowerRules($customerType),
            self::RATE_CLASS_CITY_OFFICES => $this->getCityOfficesRules(),
            self::RATE_CLASS_CITY_STREETLIGHTS => $this->getCityStreetlightsRules(),
            self::RATE_CLASS_OTHER_GOVERNMENT => $this->getOtherGovernmentRules(),
            default => [],
        };
    }

    /**
     * Get validation rules for residential rate class
     */
    private function getResidentialRules(): array
    {
        return array_merge(
            $this->getPersonalInfoRules(),
            $this->getContactInfoRules(),
            $this->getRequirementRules(),
            $this->getBillingRules()
        );
    }

    /**
     * Get validation rules for commercial rate class
     */
    private function getCommercialRules(): array
    {
        return array_merge(
            $this->getEstablishmentInfoRules(),
            $this->getContactInfoRules(),
            $this->getGovernmentInfoRules()
        );
    }

    /**
     * Get validation rules for power rate class
     */
    private function getPowerRules(?string $customerType): array
    {
        if ($customerType === self::CUSTOMER_TYPE_TEMPORARY_RESIDENTIAL) {
            return $this->getResidentialRules();
        }

        return array_merge(
            $this->getEstablishmentInfoRules(),
            $this->getContactInfoRules(),
            $this->getPowerGovernmentInfoRules()
        );
    }

    /**
     * Get validation rules for city offices rate class
     */
    private function getCityOfficesRules(): array
    {
        return array_merge(
            $this->getEstablishmentInfoRules(),
            $this->getContactInfoRules(),
            $this->getCityGovernmentRules(),
            $this->getBillingRules()
        );
    }

    /**
     * Get validation rules for city streetlights rate class
     */
    private function getCityStreetlightsRules(): array
    {
        return array_merge(
            $this->getEstablishmentInfoRules(),
            $this->getContactInfoRules(),
            $this->getCityGovernmentRules(),
            $this->getBillingRules()
        );
    }

    /**
     * Get validation rules for other government rate class
     */
    private function getOtherGovernmentRules(): array
    {
        return array_merge(
            $this->getEstablishmentInfoRules(),
            $this->getContactInfoRules(),
            $this->getCityGovernmentRules(),
            $this->getBillingRules()
        );
    }

    /**
     * Get personal information validation rules
     */
    private function getPersonalInfoRules(): array
    {
        return [
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
        ];
    }

    /**
     * Get establishment information validation rules
     */
    private function getEstablishmentInfoRules(): array
    {
        return [
            'account_name' => 'required|string|max:100',
            'trade_name' => 'required|string|max:100',
            'c_peza_registered_activity' => 'required|string|max:100',
            'connected_load' => 'required|numeric',
            'property_ownership' => 'required|string|max:255',
            'bill_delivery' => 'required|array|min:1',
            'bill_delivery.*' => 'required|string|in:spot_billing,email,sms,pickup,courier',
        ];
    }

    /**
     * Get contact information validation rules
     */
    private function getContactInfoRules(): array
    {
        return [
            'cp_lastname' => 'required|string|min:2|max:50',
            'cp_firstname' => 'required|string|min:3|max:50',
            'cp_middlename' => 'nullable|string|min:3|max:50',
            'cp_suffix' => 'nullable|string|max:10',
            'relationship' => 'required|string|max:50',
            'cp_email' => 'nullable|email|max:100',
            'cp_tel_no' => 'nullable|string|max:20',
            'cp_tel_no_2' => 'nullable|string|max:20',
            'cp_mobile_no' => 'required|string|max:20',
            'cp_mobile_no_2' => 'nullable|string|max:20',
        ];
    }

    /**
     * Get requirement validation rules
     */
    private function getRequirementRules(): array
    {
        return [
            // ID Category: primary or secondary
            'id_category' => 'required|string|in:primary,secondary',
            
            // Primary ID fields (required if id_category is 'primary')
            'primary_id_type' => 'required_if:id_category,primary|nullable|string|max:100',
            'primary_id_number' => 'required_if:id_category,primary|nullable|string|max:100',
            'primary_id_file' => 'required_if:id_category,primary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 1 fields (required if id_category is 'secondary')
            'secondary_id_1_type' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_1_number' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_1_file' => 'required_if:id_category,secondary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 2 fields (required if id_category is 'secondary')
            'secondary_id_2_type' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_2_number' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_2_file' => 'required_if:id_category,secondary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Senior citizen fields (required if is_senior_citizen is true)
            'is_senior_citizen' => 'nullable|in:true,false,1,0',
            'sc_from' => 'required_if:is_senior_citizen,true,1|nullable|date',
            'sc_number' => 'required_if:is_senior_citizen,true,1|nullable|string|max:100',
            'attachments.*' => self::OPTIONAL_FILE_VALIDATION_RULES,
        ];
    }

    /**
     * Get billing information validation rules
     */
    private function getBillingRules(): array
    {
        return [
            'bill_district' => 'required|string|max:255',
            'bill_barangay' => 'required|string|max:255',
            'bill_landmark' => 'nullable|string|max:255',
            'bill_subdivision' => 'nullable|string|max:255',
            'bill_street' => 'nullable|string|max:255',
            'bill_building_floor' => 'nullable|string|max:50',
            'bill_house_no' => 'nullable|string|max:50',
            'bill_delivery' => 'required|array|min:1',
            'bill_delivery.*' => 'required|string|in:spot_billing,email,sms,pickup,courier',
        ];
    }

    /**
     * Get government information validation rules
     */
    private function getGovernmentInfoRules(): array
    {
        return [
            // ID Category: primary or secondary
            'id_category' => 'required|string|in:primary,secondary',
            
            // Primary ID fields (required if id_category is 'primary')
            'primary_id_type' => 'required_if:id_category,primary|nullable|string|max:100',
            'primary_id_number' => 'required_if:id_category,primary|nullable|string|max:100',
            'primary_id_file' => 'required_if:id_category,primary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 1 fields (required if id_category is 'secondary')
            'secondary_id_1_type' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_1_number' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_1_file' => 'required_if:id_category,secondary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 2 fields (required if id_category is 'secondary')
            'secondary_id_2_type' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_2_number' => 'required_if:id_category,secondary|nullable|string|max:100',
            'secondary_id_2_file' => 'required_if:id_category,secondary|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            'cor_number' => 'required|string|max:100',
            'tin_number' => 'required|string|max:100',
            'issued_date' => 'required|date',
            // 'cg_vat_zero_tag' => 'nullable|boolean',
            'cg_ewt_tag' => self::FILE_VALIDATION_RULES,
            'cg_ft_tag' => self::FILE_VALIDATION_RULES,
        ];
    }

    /**
     * Get power-specific government information validation rules
     */
    private function getPowerGovernmentInfoRules(): array
    {
        return [
            'cor_number' => 'required|string|max:100',
            'tin_number' => 'required|string|max:100',
            'issued_date' => 'required|date',
            // 'cg_vat_zero_tag' => 'nullable|boolean',
            'cg_ewt_tag' => self::FILE_VALIDATION_RULES,
            'cg_ft_tag' => self::FILE_VALIDATION_RULES,
        ];
    }

    /**
     * Get city government validation rules (simplified)
     * Note: ID fields are optional for city offices, city streetlights, and other government
     */
    private function getCityGovernmentRules(): array
    {
        return [
            // ID Category: primary or secondary (optional for city government)
            'id_category' => 'nullable|string|in:primary,secondary',
            
            // Primary ID fields (optional for city government)
            'primary_id_type' => 'nullable|string|max:100',
            'primary_id_number' => 'nullable|string|max:100',
            'primary_id_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 1 fields (optional for city government)
            'secondary_id_1_type' => 'nullable|string|max:100',
            'secondary_id_1_number' => 'nullable|string|max:100',
            'secondary_id_1_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            // Secondary ID 2 fields (optional for city government)
            'secondary_id_2_type' => 'nullable|string|max:100',
            'secondary_id_2_number' => 'nullable|string|max:100',
            'secondary_id_2_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            
            'cg_ewt_tag' => self::FILE_VALIDATION_RULES,
            'cg_ft_tag' => self::FILE_VALIDATION_RULES,
        ];
    }

    /**
     * Configure the validator instance with custom validation logic
     *
     * @param \Illuminate\Validation\Validator $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateIDCategory($validator);
            $this->validateIDTypes($validator);
            $this->validateSecondaryIDsDifferent($validator);
            $this->validateSeniorCitizenID($validator);
        });
    }

    /**
     * Validate ID category integrity
     * Note: Skip validation for city government rate classes
     */
    private function validateIDCategory($validator): void
    {
        // Skip validation for city government rate classes
        $rateClass = $this->input('rate_class');
        if (in_array($rateClass, [self::RATE_CLASS_CITY_OFFICES, self::RATE_CLASS_CITY_STREETLIGHTS, self::RATE_CLASS_OTHER_GOVERNMENT])) {
            return;
        }
        
        $idCategory = $this->input('id_category');
        
        if ($idCategory === 'primary') {
            // Ensure no secondary ID data is present when primary is selected
            if ($this->filled(['secondary_id_1_type', 'secondary_id_1_number']) || $this->hasFile('secondary_id_1_file')) {
                $validator->errors()->add('id_category', 'Invalid ID submission: Secondary ID data found when Primary ID is selected.');
            }
        } elseif ($idCategory === 'secondary') {
            // Ensure no primary ID data is present when secondary is selected
            if ($this->filled(['primary_id_type', 'primary_id_number']) || $this->hasFile('primary_id_file')) {
                $validator->errors()->add('id_category', 'Invalid ID submission: Primary ID data found when Secondary ID is selected.');
            }
        }
    }

    /**
     * Validate ID types against allowed lists
     * Note: Skip validation for city government rate classes
     */
    private function validateIDTypes($validator): void
    {
        // Skip validation for city government rate classes
        $rateClass = $this->input('rate_class');
        if (in_array($rateClass, [self::RATE_CLASS_CITY_OFFICES, self::RATE_CLASS_CITY_STREETLIGHTS, self::RATE_CLASS_OTHER_GOVERNMENT])) {
            return;
        }
        
        $primaryIds = array_keys(config('data.primary_ids', []));
        $secondaryIds = array_keys(config('data.secondary_ids', []));
        
        if ($this->input('id_category') === 'primary' && $this->filled('primary_id_type')) {
            if (!in_array($this->input('primary_id_type'), $primaryIds)) {
                $validator->errors()->add('primary_id_type', 'Invalid primary ID type selected.');
            }
        }
        
        if ($this->input('id_category') === 'secondary') {
            if ($this->filled('secondary_id_1_type') && !in_array($this->input('secondary_id_1_type'), $secondaryIds)) {
                $validator->errors()->add('secondary_id_1_type', 'Invalid secondary ID type selected.');
            }
            
            if ($this->filled('secondary_id_2_type') && !in_array($this->input('secondary_id_2_type'), $secondaryIds)) {
                $validator->errors()->add('secondary_id_2_type', 'Invalid secondary ID type selected.');
            }
        }
    }

    /**
     * Validate that secondary IDs are different
     * Note: Skip validation for city government rate classes
     */
    private function validateSecondaryIDsDifferent($validator): void
    {
        // Skip validation for city government rate classes
        $rateClass = $this->input('rate_class');
        if (in_array($rateClass, [self::RATE_CLASS_CITY_OFFICES, self::RATE_CLASS_CITY_STREETLIGHTS, self::RATE_CLASS_OTHER_GOVERNMENT])) {
            return;
        }
        
        if ($this->input('id_category') === 'secondary') {
            $id1Type = $this->input('secondary_id_1_type');
            $id2Type = $this->input('secondary_id_2_type');
            
            if ($id1Type && $id2Type && $id1Type === $id2Type) {
                $validator->errors()->add('secondary_id_2_type', 'Secondary ID 2 must be different from Secondary ID 1.');
            }
        }
    }

    /**
     * Validate senior citizen fields when senior citizen ID is selected
     */
    private function validateSeniorCitizenID($validator): void
    {
        $primaryIdType = $this->input('primary_id_type');
        $isSeniorCitizen = $this->input('is_senior_citizen');
        
        // If senior citizen ID is selected, ensure senior citizen checkbox is enabled
        if ($primaryIdType === 'senior-citizen-id') {
            if (!$isSeniorCitizen) {
                $validator->errors()->add('is_senior_citizen', 'Senior Citizen must be checked when Senior Citizen ID is selected.');
            }
            
            // Require SC date and number
            if (!$this->filled('sc_from')) {
                $validator->errors()->add('sc_from', 'SC Date From is required when Senior Citizen ID is selected.');
            }
            
            if (!$this->filled('sc_number')) {
                $validator->errors()->add('sc_number', 'OSCA ID No. is required when Senior Citizen ID is selected.');
            }
        }
    }

    /**
     * Custom error messages
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'id_category.required' => 'Please select an ID category (Primary or Secondary).',
            'id_category.in' => 'Invalid ID category selected.',
            
            'primary_id_type.required_if' => 'Primary ID type is required.',
            'primary_id_number.required_if' => 'Primary ID number is required.',
            'primary_id_file.required_if' => 'Primary ID file upload is required.',
            'primary_id_file.mimes' => 'Primary ID must be an image (jpg, jpeg, png), PDF, or document (doc, docx) file.',
            'primary_id_file.max' => 'Primary ID file size must not exceed 5MB.',
            
            'secondary_id_1_type.required_if' => 'Secondary ID 1 type is required.',
            'secondary_id_1_number.required_if' => 'Secondary ID 1 number is required.',
            'secondary_id_1_file.required_if' => 'Secondary ID 1 file upload is required.',
            'secondary_id_1_file.mimes' => 'Secondary ID 1 must be an image (jpg, jpeg, png), PDF, or document (doc, docx) file.',
            'secondary_id_1_file.max' => 'Secondary ID 1 file size must not exceed 5MB.',
            
            'secondary_id_2_type.required_if' => 'Secondary ID 2 type is required.',
            'secondary_id_2_number.required_if' => 'Secondary ID 2 number is required.',
            'secondary_id_2_file.required_if' => 'Secondary ID 2 file upload is required.',
            'secondary_id_2_file.mimes' => 'Secondary ID 2 must be an image (jpg, jpeg, png), PDF, or document (doc, docx) file.',
            'secondary_id_2_file.max' => 'Secondary ID 2 file size must not exceed 5MB.',
        ];
    }
}
