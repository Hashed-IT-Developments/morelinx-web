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

    protected $fillable = [
        'customer_application_id',
        'inspector_id',
        'status',
        'house_loc',
        'meter_loc',
        'schedule_date',
        'sketch_loc',
        'near_meter_serial_1',
        'near_meter_serial_2',
        'user_id',
        'inspection_time',
        'bill_deposit',
        'material_deposit',
        'total_labor_costs',
        'labor_cost',
        'feeder',
        'meter_type',
        'service_drop_size',
        'protection',
        'meter_class',
        'connected_load',
        'transformer_size',
        'signature',
        'remarks',
        'pole_number',
        'meter_brand',
        'meter_form',
        'service_type',
        'type_of_installation',
        'attachments',
    ];
    
    protected $casts = [
        'attachments' => 'array',
        'is_mepc' => 'boolean',
    ];

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
        return false;
    }


    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'created') {
            return false;
        }

        if ($event === 'updated') {

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
