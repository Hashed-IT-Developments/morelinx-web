<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustApplnInspection extends Model implements RequiresApprovalFlow
{
    use HasFactory, HasApprovalFlow;

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
            // Initialize approval flow when status changes to 'for_inspection_approval'
            return $this->isDirty('status') && $this->status === InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
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
