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
    private const FILE_VALIDATION_RULES = 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048';
    private const OPTIONAL_FILE_VALIDATION_RULES = 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048';

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
            'bill_delivery' => 'required|string|max:50',
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
            'id_type' => 'required|string|max:100',
            'id_number' => 'required|string|max:100',
            'id_type_2' => 'nullable|string|max:100',
            'id_number_2' => 'nullable|string|max:100',
            'is_senior_citizen' => 'required|boolean',
            'sc_from' => 'nullable|date',
            'sc_number' => 'nullable|string|max:100',
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
            'bill_delivery' => 'required|string|max:50',
        ];
    }

    /**
     * Get government information validation rules
     */
    private function getGovernmentInfoRules(): array
    {
        return [
            'id_type' => 'required|string|max:100',
            'id_number' => 'required|string|max:100',
            'id_type_2' => 'nullable|string|max:100',
            'id_number_2' => 'nullable|string|max:100',
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
     */
    private function getCityGovernmentRules(): array
    {
        return [
            'cg_ewt_tag' => self::FILE_VALIDATION_RULES,
            'cg_ft_tag' => self::FILE_VALIDATION_RULES,
        ];
    }
}
