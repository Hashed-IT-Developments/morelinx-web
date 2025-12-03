<?php

namespace App\Enums;

enum TimelineStageEnum: string
{
    case DURING_APPLICATION = 'during_application';
    case FORWARDED_TO_INSPECTOR = 'forwarded_to_inspector';
    case INSPECTION_DATE = 'inspection_date';
    case INSPECTION_UPLOADED_TO_SYSTEM = 'inspection_uploaded_to_system';
    case PAID_TO_CASHIER = 'paid_to_cashier';
    case CONTRACT_SIGNED = 'contract_signed';
    case ASSIGNED_TO_LINEMAN = 'assigned_to_lineman';
    case DOWNLOADED_TO_LINEMAN = 'downloaded_to_lineman';
    case INSTALLED_DATE = 'installed_date';
    case ACTIVATED = 'activated';

    /**
     * Get all timeline stages as array of string values
     */
    public static function values(): array
    {
        return array_map(fn(self $case) => $case->value, self::cases());
    }

    /**
     * Get active stages (excluding activated)
     */
    public static function activeStages(): array
    {
        return array_map(
            fn(self $case) => $case->value,
            array_filter(self::cases(), fn(self $case) => $case !== self::ACTIVATED)
        );
    }

    /**
     * Check if stage is the final/completed stage
     */
    public function isCompleted(): bool
    {
        return $this === self::ACTIVATED;
    }
}
