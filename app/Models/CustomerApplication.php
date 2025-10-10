<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CustomerApplication extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function barangay():BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function customerType():BelongsTo
    {
        return $this->belongsTo(CustomerType::class);
    }

    public function customerApplicationRequirements():HasMany
    {
        return $this->hasMany(CustApplnReq::class);
    }

    public function contactInfo():HasOne
    {
        return $this->hasOne(CaContactInfo::class);
    }

    public function billInfo():HasOne
    {
        return $this->hasOne(CaBillInfo::class);
    }

    public function inspections():HasMany
    {
        return $this->hasMany(CustApplnInspection::class);
    }

    public function scopeSearch(Builder $query, string $searchTerms): void
    {
        $searchTerms = trim($searchTerms);
        $query->where(function ($q) use ($searchTerms) {
            $q->where('account_number', 'like', "%{$searchTerms}%")
            ->orWhereRaw(
                "LOWER(CONCAT_WS(' ', COALESCE(first_name,''), COALESCE(middle_name,''), COALESCE(last_name,''), COALESCE(suffix,''))) LIKE ?",
                ['%' . strtolower($searchTerms) . '%']
            )
            ->orWhereRaw("LOWER(first_name) LIKE ?", ['%' . strtolower($searchTerms) . '%'])
            ->orWhereRaw("LOWER(middle_name) LIKE ?", ['%' . strtolower($searchTerms) . '%'])
            ->orWhereRaw("LOWER(last_name) LIKE ?", ['%' . strtolower($searchTerms) . '%'])
            ->orWhereRaw("LOWER(suffix) LIKE ?", ['%' . strtolower($searchTerms) . '%']);
        });
    }
}
