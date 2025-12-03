<?php

namespace App\Models;

use App\Enums\PaymentTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentType extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'transaction_id',
        'payment_type',
        'amount',
        'bank',
        'check_number',
        'check_issue_date',
        'check_expiration_date',
        'bank_transaction_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'check_issue_date' => 'date',
        'check_expiration_date' => 'date',
        'payment_type' => PaymentTypeEnum::class,
    ];

    /**
     * Get the transaction that owns this payment type.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get list of Philippine banks for check payments
     */
    public static function getPhilippineBanks(): array
    {
        return config('banks.philippine_banks', []);
    }

    /**
     * Get Philippine banks formatted for frontend display
     */
    public static function getPhilippineBanksFormatted(): array
    {
        $banks = config('banks.philippine_banks', []);
        $format = config('banks.display_format', 'code_with_name');
        
        $formatted = [];
        foreach ($banks as $code => $name) {
            switch ($format) {
                case 'code_only':
                    $formatted[] = ['value' => $code, 'label' => $code];
                    break;
                case 'name_only':
                    $formatted[] = ['value' => $code, 'label' => $name];
                    break;
                case 'code_with_name':
                default:
                    $formatted[] = ['value' => $code, 'label' => "$name ($code)"];
                    break;
            }
        }
        
        return $formatted;
    }

    /**
     * Get banks by category
     */
    public static function getBanksByCategory(string $category): array
    {
        $categories = config('banks.categories', []);
        $bankCodes = $categories[$category] ?? [];
        $allBanks = config('banks.philippine_banks', []);
        
        $result = [];
        foreach ($bankCodes as $code) {
            if (isset($allBanks[$code])) {
                $result[$code] = $allBanks[$code];
            }
        }
        
        return $result;
    }

    /**
     * Check if bank is a valid Philippine bank
     */
    public static function isValidPhilippineBank(string $bank): bool
    {
        $banks = config('banks.philippine_banks', []);
        return array_key_exists($bank, $banks);
    }
}
