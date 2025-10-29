<?php

namespace App\Models;

use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payable extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payables';

    protected $fillable = [
        'customer_account_id',
        'customer_payable',
        'type',
        'bill_month',
        'total_amount_due',
        'status',
        'amount_paid',
        'balance',
    ];

    protected $casts = [
        'total_amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'status' => PayableStatusEnum::class,
    ];

    public function customerAccount()
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function definitions()
    {
        return $this->hasMany(PayablesDefinition::class, 'payable_id');
    }

    /**
     * Check if this payable is subject to EWT
     */
    public function isSubjectToEWT(): bool
    {
        if (!$this->type) {
            return false; // If no type assigned, assume not taxable
        }

        try {
            $typeEnum = new PayableTypeEnum($this->type);
            return $typeEnum->isSubjectToEWT();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get the reason why this payable is excluded from EWT
     */
    public function getEWTExclusionReason(): ?string
    {
        if (!$this->type) {
            return 'Type not assigned';
        }

        try {
            $typeEnum = new PayableTypeEnum($this->type);
            return $typeEnum->getEWTExclusionReason();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get the display label for this payable type
     */
    public function getTypeLabel(): ?string
    {
        if (!$this->type) {
            return null;
        }

        try {
            $typeEnum = new PayableTypeEnum($this->type);
            return $typeEnum->getLabel();
        } catch (\Exception $e) {
            return ucwords(str_replace('_', ' ', $this->type));
        }
    }
}