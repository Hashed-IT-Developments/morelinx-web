<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustApplnInspection extends Model implements RequiresApprovalFlow
{
    use HasFactory, HasApprovalFlow, SoftDeletes;

     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

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

    public function customerApplication():BelongsTo {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function inspector():BelongsTo {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function materialsUsed(): HasMany
    {
        return $this->hasMany(CustApplnInspMat::class, 'cust_appln_inspection_id');
    }

    public function materialDeposit(): float
    {
        $this->loadMissing('materialsUsed');

        if ($this->materialsUsed->isEmpty()) {
            return 0.0;
        }

        if (!is_null($this->material_deposit)) {
            return (float) $this->material_deposit;
        }

        $total = $this->materialsUsed->sum(fn ($material) => $material->quantity * $material->amount);

        $this->updateQuietly(['material_deposit' => $total]);

        return (float) $total;
    }

}
