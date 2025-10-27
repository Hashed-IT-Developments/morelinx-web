<?php

namespace App\Models;

use App\Models\Traits\HasApprovalFlow;
use App\Models\Traits\HasTransactions;
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
    use HasFactory, HasApprovalFlow, HasTransactions, SoftDeletes;

    protected $guarded = [];
    
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

    public function payables():HasMany
    {
        return $this->hasMany(Payable::class);
    }

    public function customerAccount():HasOne {
        return $this->hasOne(CustomerAccount::class);
    }

    /**
     * Get the credit balance for this customer application
     */
    public function creditBalance(): HasOne
    {
        return $this->hasOne(CreditBalance::class);
    }

    /**
     * NOTE: This accessor constructs the full address of the customer application.
     * When using this attribute, make sure to load the barangay relationship to avoid N+1 query issues.
     */
    public function getFullAddressAttribute(): string
    {
        if(!$this->relationLoaded('barangay')) {
            return $this->house_number . ' ' . $this->street . ', ' . $this->city;
        }

        $parts = [
            $this->house_number,
            $this->street,
            $this->barangay ? $this->barangay->name : null,
            $this->city,
        ];

        return implode(', ', array_filter($parts));
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->first_name, $this->middle_name, $this->last_name, $this->suffix])));
    }

    public function getIdentityAttribute() {
        if($this->customerType->rate_class=="residential") {
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

    public function createCustomerAccount() {
        $user = Auth::user();

        //check first if account already exists for this application
        if($this->customerAccount) return $this->customerAccount;

        $acct = CustomerAccount::create([
           'customer_application_id' => $this->id,
           'account_number' => $this->account_number,
           'account_name' => $this->identity,
           'barangay_id' => $this->barangay_id,
           'district_id' => $this->district_id,
           'block' => $this->block,
           'customer_type_id' => $this->customer_type_id,
           'account_status' => "new", //termporary
           'contact_number' => $this->getContactNumber(),
           'email_address' => $this->email_address,
        //    'customer_id' => where do we get customer ID?,
           'user_id' => $user ? $user->id : null,
        //    'multiplier' => $this->multiplier,
           'is_sc' => $this->is_sc,
           'is_isnap' => $this->is_isnap ?? false,
           'sc_date_applied' => $this->sc_from,
           'house_number' => $this->unit_no,
        //    'meter_loc' => $this->getLatestInspection()->meter_loc
        ]);

        return $acct;
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
