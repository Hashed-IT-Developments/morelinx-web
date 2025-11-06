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
use Illuminate\Support\Facades\DB;

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

    /**
     * Get the module name for approval flow initialization
     */
    public function getApprovalModule(): string
    {
        return ModuleName::CUSTOMER_APPLICATION;
    }

    /**
     * Get the department ID for approval flow (optional)
     */
    public function getApprovalDepartmentId(): ?int
    {
        return null; // No department filtering for customer applications
    }

    /**
     * Determine if approval flow should be initialized automatically
     */
    public function shouldInitializeApprovalFlow(): bool
    {
        return true; // Always initialize approval flow for customer applications
    }

    /**
     * Get the column name that should be updated when approval flow is completed
     */
    public function getApprovalStatusColumn(): ?string
    {
        return 'status';
    }

    /**
     * Get the value to set in the status column when approval flow is completed
     */
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

    /**
     * Get inspections including soft deleted ones.
     */
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

    /**
     * NOTE: This accessor constructs the full address of the customer application.
     * The barangay relationship will be automatically loaded if not already loaded.
     */
    public function getFullAddressAttribute(): string
    {
        $parts = [
            $this->unit_no,
            $this->building,
            $this->street,
            $this->subdivision,
            $this->sitio,
        ];

        // Load barangay relationship if not already loaded
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

    public function getIdentityAttribute() {

        if(!$this->relationLoaded('customerType')) {
            return null;
        }

        if($this->customerType->rate_class=="residential") {
            return $this->getFullNameAttribute();
        }

        if(!$this->trade_name) return "ID#: " . str_pad($this->id, 6, '0', STR_PAD_LEFT);

        return $this->trade_name;
    }

    public function scopeSearch(Builder $query, string $searchTerms): void
    {
        $searchTerms = trim($searchTerms);
        $searchLower = strtolower($searchTerms);
        
        $query->where(function ($q) use ($searchTerms, $searchLower) {
            $q->where('account_number', $searchTerms)
            ->orWhere('account_name', 'like', "%{$searchTerms}%");
            
            // Database-agnostic full name search (works with both MySQL and SQLite)
            if (DB::connection()->getDriverName() === 'sqlite') {
                // SQLite: Use || for concatenation
                $q->orWhereRaw(
                    "LOWER(COALESCE(first_name,'') || ' ' || COALESCE(middle_name,'') || ' ' || COALESCE(last_name,'') || ' ' || COALESCE(suffix,'')) LIKE ?",
                    ['%' . $searchLower . '%']
                );
            } else {
                // MySQL: Use CONCAT_WS
                $q->orWhereRaw(
                    "LOWER(CONCAT_WS(' ', COALESCE(first_name,''), COALESCE(middle_name,''), COALESCE(last_name,''), COALESCE(suffix,''))) LIKE ?",
                    ['%' . $searchLower . '%']
                );
            }
            
            $q->orWhereRaw("LOWER(first_name) LIKE ?", ['%' . $searchLower . '%'])
            ->orWhereRaw("LOWER(middle_name) LIKE ?", ['%' . $searchLower . '%'])
            ->orWhereRaw("LOWER(last_name) LIKE ?", ['%' . $searchLower . '%'])
            ->orWhereRaw("LOWER(suffix) LIKE ?", ['%' . $searchLower . '%']);
        });
    }

    /**
     * Create a customer account from this application.
     *
     * @return CustomerAccount
     */
    public function createAccount(): CustomerAccount
    {
        // Return existing account if already created
        if ($this->account) {
            return $this->account;
        }

        $latestInspection = $this->getLatestInspection();
        $user = Auth::user();

        return CustomerAccount::create([
            'customer_application_id' => $this->id,
            'account_number' => $this->account_number,
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
}
