<?php

namespace App\Models;

use App\Models\Traits\HasTransactions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CustomerAccount extends Model
{
    use HasFactory, HasTransactions;

    protected $guarded = [];

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('account_number', 'like', "%{$search}%")
              ->orWhere('account_name', 'like', "%{$search}%")
              ->orWhereHas('application', function ($q) use ($search) {
                  $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
              });
        });
    }

    public function application(): BelongsTo {
        return $this->belongsTo(CustomerApplication::class, 'customer_application_id');
    }

    public function barangay(): BelongsTo {
        return $this->belongsTo(Barangay::class);
    }

    public function district(): BelongsTo {
        return $this->belongsTo(District::class);
    }

    public function route(): BelongsTo {
        return $this->belongsTo(Route::class);
    }

    public function customerType(): BelongsTo {
        return $this->belongsTo(CustomerType::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function payables(): HasMany
    {
        return $this->hasMany(Payable::class);
    }

    /**
     * Get the credit balance for this customer account
     */
    public function creditBalance(): HasOne
    {
        return $this->hasOne(CreditBalance::class);
    }

    public static function generateAccountNumber() {
        //temporary for now...
        return substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 10);
    }
}
