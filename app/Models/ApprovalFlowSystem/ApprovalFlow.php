<?php

namespace App\Models\ApprovalFlowSystem;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ApprovalFlow extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'module',
        'description',
        'department_id',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalFlowStep::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvalStates(): HasMany
    {
        return $this->hasMany(ApprovalState::class);
    }
}