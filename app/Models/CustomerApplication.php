<?php

namespace App\Models;

use App\Models\Traits\HasApprovalFlow;
use App\Contracts\RequiresApprovalFlow;
use App\Enums\ModuleName;
use App\Enums\ApplicationStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class CustomerApplication extends Model implements RequiresApprovalFlow
{
    use HasFactory, HasApprovalFlow, SoftDeletes;

    protected $fillable = [
        'account_number',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'birth_date',
        'nationality',
        'gender',
        'marital_status',
        'barangay_id',
        'landmark',
        'sitio',
        'unit_no',
        'building',
        'street',
        'subdivision',
        'district_id',
        'block',
        'route',
        'customer_type_id',
        'connected_load',
        'id_type_1',
        'id_type_2',
        'id_number_1',
        'id_number_2',
        'is_sc',
        'sc_from',
        'sc_number',
        'property_ownership',
        'cp_last_name',
        'cp_first_name',
        'cp_middle_name',
        'cp_relation',
        'email_address',
        'tel_no_1',
        'tel_no_2',
        'mobile_1',
        'mobile_2',
        'sketch_lat_long',
        'status',
        'account_name',
        'trade_name',
        'c_peza_registered_activity',
        'cor_number',
        'tin_number',
        'cg_vat_zero_tag',
        'is_isnap',
    ];

    protected $casts = [
        'is_isnap' => 'boolean',
        'is_sc' => 'boolean',
        'cg_vat_zero_tag' => 'boolean',
    ];

    protected $appends = [
        'full_address',
        'full_name',
        'has_approval_flow',
        'is_approval_complete',
        'is_approval_pending',
        'is_approval_rejected',
        'identity'
    ];

    public function getApprovalModule(): string
    {
        return ModuleName::CUSTOMER_APPLICATION;
    }

   
    public function getApprovalDepartmentId(): ?int
    {
        return null;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return true; 
    }

   
    public function getApprovalStatusColumn(): ?string
    {
        return 'status';
    }

   
    public function getApprovedStatusValue(): mixed
    {
        return $this->is_isnap ? ApplicationStatusEnum::ISNAP_PENDING : ApplicationStatusEnum::FOR_INSPECTION;
    }

    public function getFinalApprovedStatusValue(): mixed
    {
        return ApplicationStatusEnum::VERIFIED;
    }

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

    public function customerApplicationAttachments():HasMany
    {
        return $this->hasMany(CaAttachment::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CaAttachment::class, 'customer_application_id');
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

   
    public function inspectionsWithTrashed():HasMany
    {
        return $this->hasMany(CustApplnInspection::class)->withTrashed();
    }

    public function district():BelongsTo {
        return $this->belongsTo(District::class);
    }

    public function account():HasOne {
        return $this->hasOne(CustomerAccount::class);
    }

    public function applicationContract(): HasOne
    {
        return $this->hasOne(ApplicationContract::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(Log::class, 'module_id')->where('type', 'application')->with('user')->orderBy('created_at', 'desc');
    }

   
    public function getFullAddressAttribute(): string
    {
        $parts = [
            $this->unit_no,
            $this->building,
            $this->street,
            $this->subdivision,
            $this->sitio,
        ];

       
        $this->loadMissing('barangay.town');

        if ($this->barangay) {
            $parts[] = $this->barangay->name;

            if ($this->barangay->town) {
                $parts[] = $this->barangay->town->name;
            }
        }

        return implode(', ', array_filter($parts));
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->first_name, $this->middle_name, $this->last_name, $this->suffix])));
    }

    public function getIdentityAttribute() 
    {
      
        if (!$this->relationLoaded('customerType')) {
            $this->loadMissing('customerType');
        }
        
        if(in_array($this->customerType?->customer_type, ['residential','temporary_residential'])) {
            return $this->getFullNameAttribute();
        }

        if(!$this->trade_name) return "ID#: " . str_pad($this->id, 6, '0', STR_PAD_LEFT);

        return $this->trade_name;
    }

    public function scopeSearch(Builder $query, string $searchTerms): void
    {
        $searchTerms = trim($searchTerms);
        $query->where(function ($q) use ($searchTerms) {
            $q->where('account_number', $searchTerms)
            ->orWhere('account_name', 'like', "%{$searchTerms}%")
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

   
    public function createAccount(): CustomerAccount
    {
       
        if ($this->account) {
            return $this->account;
        }

      
        $this->loadMissing('barangay.town');
        
        
        $townAlias = $this->barangay?->town?->alias ?? '';
        $barangayAlias = $this->barangay?->alias ?? '';
        $code = strtoupper($townAlias . $barangayAlias);
        
      
        $seriesNumber = CustomerAccount::getNextSeriesNumber();
        
      
        $accountNumber = $code . $seriesNumber;

        $latestInspection = $this->getLatestInspection();
        $user = Auth::user();

        $account = CustomerAccount::create([
            'customer_application_id' => $this->id,
            'code' => $code,
            'account_number' => $accountNumber,
            'series_number' => $seriesNumber,
            'account_name' => $this->identity,
            'barangay_id' => $this->barangay_id,
            'district_id' => $this->district_id,
            'route_id' => $this->route_id,
            'block' => $this->block,
            'customer_type_id' => $this->customer_type_id,
            'account_status' => 'new',
            'contact_number' => $this->getContactNumber(),
            'email_address' => $this->email_address,
            'user_id' => $user?->id,
            'is_sc' => $this->is_sc ?? false,
            'is_isnap' => $this->is_isnap ?? false,
            'sc_date_applied' => $this->sc_from,
            'house_number' => $this->unit_no,
            'meter_loc' => $latestInspection?->meter_loc,
        ]);

        
        $this->update(['account_number' => $accountNumber]);

        return $account;
    }

    private function getContactNumber() {
        $parts = [];
        $labels = [
            'mobile_1' => 'Mobile:',
            'mobile_2' => 'Mobile:',
            'tel_no_1' => 'Tel No.:',
            'tel_no_2' => 'Tel No.:',
        ];

        foreach ($labels as $field => $label) {
            $value = trim((string) ($this->{$field} ?? ''));
            if ($value !== '') {
                $parts[] = $label . ' ' . $value;
            }
        }

        return implode(', ', $parts);
    }

    public function getLatestInspection() {
        return CustApplnInspection::where('customer_application_id', $this->id)
            ->orderBy('created_at','desc')
            ->first();
    }

   
    public function areEnergizationPayablesPaid(): bool
    {
        if (!$this->account) {
            return false;
        }

        return $this->account->areEnergizationPayablesPaid();
    }

  
    public function getEnergizationPayables()
    {
        if (!$this->account) {
            return collect();
        }

        return $this->account->getEnergizationPayables();
    }
}