<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AmendmentRequest extends Model
{
    protected $guarded = [];

    public $casts =[
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public $appends = ['fields_count','status'];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function byUser(): BelongsTo {
        return $this->belongsTo(User::class, 'by_user_id');
    }

    public function customerAccount(): BelongsTo {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function amendmentRequestItems(): HasMany {
        return $this->hasMany(AmendmentRequestItem::class);
    }

    public function getFieldsCountAttribute()
    {
        if (! $this->relationLoaded('amendmentRequestItems')) {
            return null;
        }

        return $this->amendmentRequestItems->count();
    }

    public function getStatusAttribute() {
        if($this->approved_at) return "Approved: " . $this->approved_at->format('M-d-Y');
        if($this->rejected_at) return "Rejected: " . $this->rejected_at->format('M-d-Y');

        return "Pending";
    }
}
