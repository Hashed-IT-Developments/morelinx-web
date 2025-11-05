<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * Payable Type Enum - Categorizes payables for tax and business logic
 * 
 * @method static static CONNECTION_FEE()
 * @method static static SERVICE_FEE()
 * @method static static METER_DEPOSIT()
 * @method static static BILL_DEPOSIT()
 * @method static static SECURITY_DEPOSIT()
 * @method static static MONTHLY_BILL()
 * @method static static RECONNECTION_FEE()
 * @method static static INSTALLATION_FEE()
 * @method static static INSPECTION_FEE()
 * @method static static DISCONNECTION_FEE()
 * @method static static MATERIAL_COST()
 * @method static static LABOR_COST()
 * @method static static PENALTY()
 * @method static static SURCHARGE()
 * @method static static ISNAP_FEE()
 * @method static static OTHER()
 */
final class PayableTypeEnum extends Enum
{
    const CONNECTION_FEE = 'connection_fee';
    const SERVICE_FEE = 'service_fee';
    const METER_DEPOSIT = 'meter_deposit';
    const BILL_DEPOSIT = 'bill_deposit';
    const SECURITY_DEPOSIT = 'security_deposit';
    const MONTHLY_BILL = 'monthly_bill';
    const RECONNECTION_FEE = 'reconnection_fee';
    const INSTALLATION_FEE = 'installation_fee';
    const INSPECTION_FEE = 'inspection_fee';
    const DISCONNECTION_FEE = 'disconnection_fee';
    const MATERIAL_COST = 'material_cost';
    const LABOR_COST = 'labor_cost';
    const PENALTY = 'penalty';
    const SURCHARGE = 'surcharge';
    const ISNAP_FEE = 'isnap_fee';
    const OTHER = 'other';

    /**
     * Check if this payable type is subject to EWT (Expanded Withholding Tax)
     * 
     * Deposits are NOT subject to EWT because they are refundable liabilities,
     * not income. Only actual services, consumption, and fees are taxable.
     */
    public function isSubjectToEWT(): bool
    {
        return !in_array($this->value, [
            self::METER_DEPOSIT,
            self::BILL_DEPOSIT,
            self::SECURITY_DEPOSIT,
        ]);
    }

    /**
     * Get the reason why this payable type is excluded from EWT
     * Returns null if the payable IS subject to EWT
     */
    public function getEWTExclusionReason(): ?string
    {
        if ($this->isSubjectToEWT()) {
            return null;
        }

        $reasons = [
            self::METER_DEPOSIT => 'Refundable deposit - not taxable income',
            self::BILL_DEPOSIT => 'Security deposit - not taxable income',
            self::SECURITY_DEPOSIT => 'Refundable security deposit - not taxable income',
        ];

        return $reasons[$this->value] ?? 'Not subject to EWT';
    }

    /**
     * Get display label for this payable type
     */
    public function getLabel(): string
    {
        $labels = [
            self::CONNECTION_FEE => 'Connection Fee',
            self::SERVICE_FEE => 'Service Fee',
            self::METER_DEPOSIT => 'Meter Deposit',
            self::BILL_DEPOSIT => 'Bill Deposit',
            self::SECURITY_DEPOSIT => 'Security Deposit',
            self::MONTHLY_BILL => 'Monthly Bill',
            self::RECONNECTION_FEE => 'Reconnection Fee',
            self::INSTALLATION_FEE => 'Installation Fee',
            self::INSPECTION_FEE => 'Inspection Fee',
            self::DISCONNECTION_FEE => 'Disconnection Fee',
            self::MATERIAL_COST => 'Material Cost',
            self::LABOR_COST => 'Labor Cost',
            self::PENALTY => 'Penalty',
            self::SURCHARGE => 'Surcharge',
            self::OTHER => 'Other',
        ];

        return $labels[$this->value] ?? ucwords(str_replace('_', ' ', $this->value));
    }

    /**
     * Guess the payable type from a payable name/description
     * Used for auto-assignment when creating payables
     */
    public static function guessFromName(string $name): string
    {
        $name = strtolower($name);

        // Deposits (check first as they're most important)
        if (str_contains($name, 'meter deposit') || str_contains($name, 'meter dep')) {
            return self::METER_DEPOSIT;
        }
        if (str_contains($name, 'bill deposit') || str_contains($name, 'billing deposit')) {
            return self::BILL_DEPOSIT;
        }
        if (str_contains($name, 'security deposit') || str_contains($name, 'sec deposit')) {
            return self::SECURITY_DEPOSIT;
        }

        // Fees and services
        if (str_contains($name, 'connection fee') || str_contains($name, 'connection charge')) {
            return self::CONNECTION_FEE;
        }
        if (str_contains($name, 'service fee') || str_contains($name, 'service charge')) {
            return self::SERVICE_FEE;
        }
        if (str_contains($name, 'reconnection') || str_contains($name, 'reconnect')) {
            return self::RECONNECTION_FEE;
        }
        if (str_contains($name, 'installation') || str_contains($name, 'install')) {
            return self::INSTALLATION_FEE;
        }
        if (str_contains($name, 'inspection')) {
            return self::INSPECTION_FEE;
        }
        if (str_contains($name, 'disconnection') || str_contains($name, 'disconnect')) {
            return self::DISCONNECTION_FEE;
        }
        if (str_contains($name, 'material')) {
            return self::MATERIAL_COST;
        }
        if (str_contains($name, 'labor') || str_contains($name, 'labour')) {
            return self::LABOR_COST;
        }

        // Charges
        if (str_contains($name, 'penalty') || str_contains($name, 'penalties')) {
            return self::PENALTY;
        }
        if (str_contains($name, 'surcharge')) {
            return self::SURCHARGE;
        }
        if (str_contains($name, 'monthly') || str_contains($name, 'bill') || str_contains($name, 'consumption')) {
            return self::MONTHLY_BILL;
        }

        // Default
        return self::OTHER;
    }
}
