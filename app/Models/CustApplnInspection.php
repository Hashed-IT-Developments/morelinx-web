<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustApplnInspection extends Model implements RequiresApprovalFlow
{
    use HasFactory, HasApprovalFlow, SoftDeletes;

    protected static function boot()
    {
        parent::boot();

        static::updated(function ($inspection) {
            // When status changes to disapproved, create a duplicate for reinspection
            if ($inspection->isDirty('status') && $inspection->status == InspectionStatusEnum::DISAPPROVED) {
                static::createReinspection($inspection);
            }
        });
    }

    /**
     * Create a duplicate inspection record for reinspection
     */
    protected static function createReinspection($originalInspection)
    {
        $duplicate = $originalInspection->replicate();
        $duplicate->status = InspectionStatusEnum::FOR_REINSPECTION;
        $duplicate->inspector_id = null;
        $duplicate->schedule_date = null;
        $duplicate->save();
    }

    public function getApprovalModule(): string
    {
        return ModuleName::FOR_INSPECTION_APPROVAL;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return null;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return false; // Don't initialize on creation
    }

    /**
     * Define when approval flow should be initialized based on events
     */
    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'created') {
            return false; // Never initialize on creation
        }

        if ($event === 'updated') {
            // Initialize approval flow when status changes to 'approved' (inspector approved, now needs supervisor approval)
            return $this->isDirty('status') && $this->status === InspectionStatusEnum::APPROVED;
        }

        return false;
    }

     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    public function customerApplication():BelongsTo {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function inspector():BelongsTo {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}
